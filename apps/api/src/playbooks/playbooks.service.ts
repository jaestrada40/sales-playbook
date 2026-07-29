import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddSectionDto,
  CreatePlaybookDto,
  UpdatePlaybookDto,
} from './dto/playbook.dto';

@Injectable()
export class PlaybooksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(ownerId: string) {
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    return this.prisma.playbook.findMany({
      where: {
        OR: [
          { ownerId },
          ...(owner?.teamId ? [{ owner: { teamId: owner.teamId } }] : []),
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            nodes: {
              orderBy: { sortOrder: 'asc' },
              include: { branches: true },
            },
          },
        },
      },
    });
  }

  async findOne(ownerId: string, id: string) {
    const playbook = await this.prisma.playbook.findFirst({
      where: { id, ownerId },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            nodes: {
              orderBy: { sortOrder: 'asc' },
              include: { branches: true },
            },
          },
        },
      },
    });
    if (!playbook) throw new NotFoundException('Playbook no encontrado');
    return playbook;
  }

  create(ownerId: string, dto: CreatePlaybookDto) {
    return this.prisma.playbook.create({
      data: {
        ownerId,
        title: dto.title.trim(),
        description: dto.description?.trim() ?? '',
        language: dto.language ?? 'es',
        industry: dto.industry ?? 'general',
      },
    });
  }

  async addSection(ownerId: string, playbookId: string, dto: AddSectionDto) {
    await this.findOne(ownerId, playbookId);
    return this.prisma.playbookSection.create({
      data: {
        playbookId,
        title: dto.title.trim(),
        sortOrder: dto.sortOrder ?? 0,
        nodes: dto.nodes
          ? {
              create: dto.nodes.map((node) => ({
                id: node.id,
                title: node.title,
                script: node.script,
                suggestedQuestion: node.suggestedQuestion ?? '',
                type: node.type ?? 'SCRIPT',
                sortOrder: node.sortOrder ?? 0,
              })),
            }
          : undefined,
      },
      include: { nodes: true },
    });
  }

  async update(ownerId: string, id: string, dto: UpdatePlaybookDto) {
    await this.findOne(ownerId, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.playbookSection.deleteMany({ where: { playbookId: id } });
      await tx.playbook.update({
        where: { id },
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim() ?? '',
          language: dto.language ?? 'es',
          industry: dto.industry ?? 'general',
          version: dto.version.trim(),
          status: dto.status,
          sections: {
            create: dto.sections.map((section, sectionIndex) => ({
              title: section.title.trim(),
              sortOrder: section.sortOrder ?? sectionIndex,
              nodes: {
                create: (section.nodes ?? []).map((node, nodeIndex) => ({
                  id: node.id,
                  title: node.title.trim(),
                  script: node.script,
                  suggestedQuestion: node.suggestedQuestion ?? '',
                  type: node.type ?? 'SCRIPT',
                  sortOrder: node.sortOrder ?? nodeIndex,
                })),
              },
            })),
          },
        },
      });
      const nodeIds = new Set(
        dto.sections.flatMap((section) =>
          (section.nodes ?? [])
            .map((node) => node.id)
            .filter((nodeId): nodeId is string => Boolean(nodeId)),
        ),
      );
      const branches = dto.sections.flatMap((section) =>
        (section.nodes ?? []).flatMap((node) =>
          node.id
            ? (node.branches ?? [])
                .filter((branch) => nodeIds.has(branch.targetNodeId))
                .map((branch) => ({
                  sourceNodeId: node.id!,
                  targetNodeId: branch.targetNodeId,
                  customerResponse: branch.customerResponse,
                }))
            : [],
        ),
      );
      if (branches.length) await tx.nodeBranch.createMany({ data: branches });
    });
    return this.findOne(ownerId, id);
  }
}
