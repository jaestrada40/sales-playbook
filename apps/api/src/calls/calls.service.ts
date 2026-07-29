import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCallDto, FinishCallDto, UpdateCallDto } from './dto/call.dto';

@Injectable()
export class CallsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateCallDto) {
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    const playbook = await this.prisma.playbook.findFirst({
      where: {
        id: dto.playbookId,
        OR: [
          { ownerId },
          ...(owner?.teamId ? [{ owner: { teamId: owner.teamId } }] : []),
        ],
      },
    });
    if (!playbook) throw new NotFoundException('Playbook no encontrado');
    let prospect = null;
    if (dto.prospectId) {
      prospect = await this.prisma.prospect.findUnique({
        where: { id: dto.prospectId },
      });
      if (!prospect) throw new NotFoundException('Prospecto no encontrado');
      if (
        prospect.assigneeId &&
        prospect.assigneeId !== ownerId &&
        owner?.role === 'SELLER'
      )
        throw new ForbiddenException('Prospecto asignado a otro vendedor');
      if (prospect.doNotCall)
        throw new BadRequestException(
          'El prospecto está en la lista de no llamar',
        );
      const compliance = await this.prisma.complianceSettings.findFirst();
      if (compliance) {
        const hour = Number(
          new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            hour12: false,
            timeZone: compliance.timezone,
          }).format(new Date()),
        );
        if (
          hour < compliance.callingStartHour ||
          hour >= compliance.callingEndHour
        )
          throw new BadRequestException(
            `Fuera del horario permitido (${compliance.callingStartHour}:00–${compliance.callingEndHour}:00 ${compliance.timezone})`,
          );
      }
      if (
        compliance?.requireConsent &&
        !dto.consentConfirmed &&
        prospect.consentStatus !== 'GRANTED'
      )
        throw new BadRequestException(
          'Debe confirmar el consentimiento antes de iniciar',
        );
    }
    const call = await this.prisma.call.create({
      data: {
        ownerId,
        playbookId: dto.playbookId,
        prospectId: dto.prospectId,
        campaignId: dto.campaignId ?? prospect?.campaignId,
        prospectName: dto.prospectName ?? prospect?.contactName ?? '',
        businessName: dto.businessName ?? prospect?.businessName ?? '',
        consentConfirmed: dto.consentConfirmed ?? false,
      },
    });
    if (prospect)
      await this.prisma.prospect.update({
        where: { id: prospect.id },
        data: {
          attempts: { increment: 1 },
          lastContactedAt: new Date(),
          status: 'CONTACTED',
        },
      });
    return call;
  }

  async finish(ownerId: string, id: string, dto: FinishCallDto) {
    const call = await this.prisma.call.findFirst({ where: { id, ownerId } });
    if (!call) throw new NotFoundException('Llamada no encontrada');
    const updated = await this.prisma.call.update({
      where: { id },
      data: {
        endedAt: new Date(),
        outcome: dto.outcome,
        followUpAt: dto.followUpAt ? new Date(dto.followUpAt) : null,
        notes: dto.notes ?? '',
        durationSeconds: dto.durationSeconds ?? call.durationSeconds,
      },
    });
    if (call.prospectId) {
      const status =
        dto.outcome === 'cita_agendada' || dto.outcome === 'interesado'
          ? 'QUALIFIED'
          : dto.outcome === 'no_interesado'
            ? 'LOST'
            : 'CONTACTED';
      await this.prisma.prospect.update({
        where: { id: call.prospectId },
        data: { status },
      });
      if (dto.outcome === 'cita_agendada' || dto.outcome === 'interesado')
        await this.prisma.opportunity.upsert({
          where: { prospectId: call.prospectId },
          create: {
            prospectId: call.prospectId,
            stage: dto.outcome === 'cita_agendada' ? 'FOLLOW_UP' : 'DISCOVERY',
          },
          update: {
            stage: dto.outcome === 'cita_agendada' ? 'FOLLOW_UP' : 'DISCOVERY',
          },
        });
      if (dto.followUpAt)
        await this.prisma.crmTask.create({
          data: {
            title:
              dto.outcome === 'cita_agendada'
                ? 'Realizar cita agendada'
                : 'Dar seguimiento al prospecto',
            dueAt: new Date(dto.followUpAt),
            ownerId,
            prospectId: call.prospectId,
          },
        });
    }
    return updated;
  }

  async update(ownerId: string, id: string, dto: UpdateCallDto) {
    const call = await this.prisma.call.findFirst({ where: { id, ownerId } });
    if (!call) throw new NotFoundException('Llamada no encontrada');
    return this.prisma.call.update({
      where: { id },
      data: {
        notes: dto.notes ?? call.notes,
        durationSeconds: dto.durationSeconds ?? call.durationSeconds,
      },
    });
  }

  findAll(ownerId: string) {
    return this.prisma.call.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { playbook: true },
    });
  }
}
