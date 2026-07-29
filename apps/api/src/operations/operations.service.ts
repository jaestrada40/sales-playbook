import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CampaignStatus,
  OpportunityStage,
  ProspectStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  ComplianceDto,
  CreateCampaignDto,
  CreateTaskDto,
  CreateTeamDto,
  DncDto,
  ImportProspectsDto,
  UpdateProspectDto,
  UpdateTeamMemberDto,
} from './dto/operations.dto';

type Actor = { sub: string; role: string };

@Injectable()
export class OperationsService {
  constructor(private readonly prisma: PrismaService) {}

  private manager(actor: Actor) {
    if (!['ADMIN', 'MANAGER'].includes(actor.role))
      throw new ForbiddenException(
        'Se requiere rol de gerente o administrador',
      );
  }

  private async context(actor: Actor) {
    const user = await this.prisma.user.findUnique({
      where: { id: actor.sub },
      select: { id: true, teamId: true, role: true },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  private auditLog(
    actorId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: object,
  ) {
    return this.prisma.auditLog.create({
      data: { actorId, action, entityType, entityId, metadata },
    });
  }

  async overview(actor: Actor) {
    const user = await this.context(actor);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const callWhere =
      actor.role === 'SELLER'
        ? { ownerId: actor.sub, createdAt: { gte: start } }
        : {
            ...(user.teamId ? { owner: { teamId: user.teamId } } : {}),
            createdAt: { gte: start },
          };
    const prospectWhere =
      actor.role === 'SELLER'
        ? { assigneeId: actor.sub }
        : user.teamId
          ? { campaign: { teamId: user.teamId } }
          : {};
    const [calls, prospects, pipeline, tasks, agents] = await Promise.all([
      this.prisma.call.findMany({
        where: callWhere,
        select: { outcome: true, durationSeconds: true },
      }),
      this.prisma.prospect.groupBy({
        by: ['status'],
        where: prospectWhere,
        _count: true,
      }),
      this.prisma.opportunity.aggregate({
        where: { prospect: prospectWhere },
        _sum: { estimatedValue: true },
        _count: true,
      }),
      this.prisma.crmTask.count({
        where: { ownerId: actor.sub, completedAt: null },
      }),
      actor.role === 'SELLER' || !user.teamId
        ? Promise.resolve([])
        : this.prisma.user.findMany({
            where: { teamId: user.teamId },
            select: {
              id: true,
              name: true,
              role: true,
              _count: {
                select: {
                  calls: {
                    where: {
                      createdAt: { gte: start },
                      durationSeconds: { gte: 120 },
                    },
                  },
                  assignedProspects: true,
                },
              },
            },
          }),
    ]);
    const validCalls = calls.filter((call) => call.durationSeconds >= 120);
    const meetings = validCalls.filter(
      (call) => call.outcome === 'cita_agendada',
    ).length;
    const qualified = validCalls.filter((call) =>
      ['interesado', 'cita_agendada'].includes(call.outcome ?? ''),
    ).length;
    return {
      callsToday: validCalls.length,
      attemptsToday: calls.length,
      shortCallsToday: calls.length - validCalls.length,
      minimumValidDurationSeconds: 120,
      meetingsToday: meetings,
      conversionRate: validCalls.length
        ? Math.round((qualified / validCalls.length) * 1000) / 10
        : 0,
      averageDurationSeconds: validCalls.length
        ? Math.round(
            validCalls.reduce((sum, call) => sum + call.durationSeconds, 0) /
              validCalls.length,
          )
        : 0,
      pipelineValue: pipeline._sum.estimatedValue ?? 0,
      opportunities: pipeline._count,
      pendingTasks: tasks,
      prospectStatus: prospects.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      agents,
    };
  }

  async prospects(actor: Actor) {
    const user = await this.context(actor);
    const where =
      actor.role === 'SELLER'
        ? { assigneeId: actor.sub }
        : user.teamId
          ? { campaign: { teamId: user.teamId } }
          : {};
    return this.prisma.prospect.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        campaign: { select: { id: true, name: true, playbookId: true } },
        assignee: { select: { id: true, name: true } },
        opportunity: true,
        tasks: { where: { completedAt: null }, orderBy: { dueAt: 'asc' } },
      },
    });
  }

  async importProspects(actor: Actor, dto: ImportProspectsDto) {
    this.manager(actor);
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaña no encontrada');
    const phones = [
      ...new Set(
        dto.prospects.map((item) => item.phone.trim()).filter(Boolean),
      ),
    ];
    const dnc = new Set(
      (
        await this.prisma.dncEntry.findMany({
          where: { phone: { in: phones } },
          select: { phone: true },
        })
      ).map((item) => item.phone),
    );
    const result = await this.prisma.$transaction(
      dto.prospects.map((item) =>
        this.prisma.prospect.create({
          data: {
            campaignId: dto.campaignId,
            businessName: item.businessName.trim(),
            contactName: item.contactName.trim(),
            phone: item.phone.trim(),
            email: item.email?.trim() ?? '',
            role: item.role ?? '',
            businessType: item.businessType ?? '',
            currentProvider: item.currentProvider ?? '',
            monthlyVolumeUSD: item.monthlyVolumeUSD ?? 0,
            terminalCount: item.terminalCount ?? 0,
            objective: item.objective ?? '',
            mainPainPoint: item.mainPainPoint ?? '',
            address: item.address ?? '',
            tags: item.tags ?? [],
            doNotCall: dnc.has(item.phone.trim()),
            status: dnc.has(item.phone.trim())
              ? ProspectStatus.DNC
              : ProspectStatus.NEW,
          },
        }),
      ),
    );
    await this.auditLog(actor.sub, 'IMPORT', 'Campaign', dto.campaignId, {
      count: result.length,
    });
    return {
      imported: result.length,
      blockedByDnc: result.filter((item) => item.doNotCall).length,
    };
  }

  async updateProspect(actor: Actor, id: string, dto: UpdateProspectDto) {
    const existing = await this.prisma.prospect.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Prospecto no encontrado');
    if (actor.role === 'SELLER' && existing.assigneeId !== actor.sub)
      throw new ForbiddenException('Prospecto no asignado');
    if (dto.assigneeId !== undefined) this.manager(actor);
    const prospect = await this.prisma.prospect.update({
      where: { id },
      data: {
        assigneeId: dto.assigneeId,
        status: dto.status as ProspectStatus | undefined,
        doNotCall: dto.doNotCall,
        consentStatus: dto.consentStatus,
        consentSource: dto.consentSource,
        consentAt: dto.consentStatus === 'GRANTED' ? new Date() : undefined,
      },
    });
    if (dto.opportunityStage || dto.estimatedValue !== undefined)
      await this.prisma.opportunity.upsert({
        where: { prospectId: id },
        create: {
          prospectId: id,
          stage:
            (dto.opportunityStage as OpportunityStage | undefined) ??
            OpportunityStage.DISCOVERY,
          estimatedValue: dto.estimatedValue ?? 0,
        },
        update: {
          stage: dto.opportunityStage as OpportunityStage | undefined,
          estimatedValue: dto.estimatedValue,
        },
      });
    await this.auditLog(actor.sub, 'UPDATE', 'Prospect', id, dto);
    return prospect;
  }

  async campaigns(actor: Actor) {
    const user = await this.context(actor);
    return this.prisma.campaign.findMany({
      where: user.teamId ? { teamId: user.teamId } : {},
      orderBy: { updatedAt: 'desc' },
      include: {
        team: true,
        manager: { select: { id: true, name: true } },
        playbook: { select: { id: true, title: true } },
        _count: { select: { prospects: true, calls: true } },
      },
    });
  }

  async createCampaign(actor: Actor, dto: CreateCampaignDto) {
    this.manager(actor);
    const campaign = await this.prisma.campaign.create({
      data: {
        name: dto.name.trim(),
        description: dto.description ?? '',
        teamId: dto.teamId,
        managerId: dto.managerId,
        playbookId: dto.playbookId,
        dailyCallGoal: dto.dailyCallGoal ?? 20,
        direction: dto.direction ?? 'OUTBOUND',
        status: CampaignStatus.ACTIVE,
      },
    });
    await this.auditLog(actor.sub, 'CREATE', 'Campaign', campaign.id);
    return campaign;
  }

  async team(actor: Actor) {
    const user = await this.context(actor);
    return {
      teams: await this.prisma.team.findMany({
        where: user.teamId && actor.role !== 'ADMIN' ? { id: user.teamId } : {},
        include: {
          users: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
    };
  }
  async createTeam(actor: Actor, dto: CreateTeamDto) {
    if (actor.role !== 'ADMIN')
      throw new ForbiddenException('Solo un administrador puede crear equipos');
    const team = await this.prisma.team.create({
      data: { name: dto.name.trim() },
    });
    await this.auditLog(actor.sub, 'CREATE', 'Team', team.id);
    return team;
  }
  async updateTeamMember(actor: Actor, id: string, dto: UpdateTeamMemberDto) {
    this.manager(actor);
    if (dto.role === 'ADMIN' && actor.role !== 'ADMIN')
      throw new ForbiddenException(
        'Solo un administrador puede asignar administradores',
      );
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        teamId: dto.teamId,
        role: dto.role as 'ADMIN' | 'MANAGER' | 'SELLER',
      },
      select: { id: true, name: true, email: true, role: true, teamId: true },
    });
    await this.auditLog(actor.sub, 'ASSIGN', 'User', id, dto);
    return user;
  }

  compliance() {
    return this.prisma.complianceSettings.findMany({
      orderBy: { jurisdiction: 'asc' },
    });
  }
  async updateCompliance(actor: Actor, dto: ComplianceDto) {
    this.manager(actor);
    const value = await this.prisma.complianceSettings.upsert({
      where: { jurisdiction: dto.jurisdiction },
      create: { ...dto, recordingEnabled: false },
      update: { ...dto, recordingEnabled: false },
    });
    await this.auditLog(actor.sub, 'UPDATE', 'ComplianceSettings', value.id);
    return value;
  }
  async purgeExpired(actor: Actor) {
    this.manager(actor);
    const settings = await this.prisma.complianceSettings.findFirst();
    if (!settings)
      throw new NotFoundException('No hay política de retención configurada');
    const cutoff = new Date(Date.now() - settings.retentionDays * 86_400_000);
    const [calls, audit] = await this.prisma.$transaction([
      this.prisma.call.deleteMany({ where: { createdAt: { lt: cutoff } } }),
      this.prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    ]);
    await this.auditLog(actor.sub, 'PURGE', 'Retention', settings.id, {
      cutoff,
      calls: calls.count,
      audit: audit.count,
    });
    return { cutoff, callsDeleted: calls.count, auditDeleted: audit.count };
  }
  async addDnc(actor: Actor, dto: DncDto) {
    const entry = await this.prisma.dncEntry.upsert({
      where: { phone: dto.phone.trim() },
      create: { phone: dto.phone.trim(), reason: dto.reason },
      update: { reason: dto.reason },
    });
    await this.prisma.prospect.updateMany({
      where: { phone: entry.phone },
      data: { doNotCall: true, status: ProspectStatus.DNC },
    });
    await this.auditLog(actor.sub, 'DNC_ADD', 'DncEntry', entry.id);
    return entry;
  }
  async audit(actor: Actor) {
    this.manager(actor);
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { actor: { select: { name: true, email: true } } },
    });
  }
  async createTask(actor: Actor, dto: CreateTaskDto) {
    if (actor.role === 'SELLER' && dto.ownerId !== actor.sub)
      throw new ForbiddenException();
    const task = await this.prisma.crmTask.create({
      data: {
        title: dto.title,
        dueAt: new Date(dto.dueAt),
        ownerId: dto.ownerId,
        prospectId: dto.prospectId,
      },
    });
    await this.auditLog(actor.sub, 'CREATE', 'CrmTask', task.id);
    return task;
  }
  async completeTask(actor: Actor, id: string) {
    const task = await this.prisma.crmTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException();
    if (task.ownerId !== actor.sub && actor.role === 'SELLER')
      throw new ForbiddenException();
    return this.prisma.crmTask.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }
}
