import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddSectionDto, CreatePlaybookDto } from './dto/playbook.dto';

@Injectable()
export class PlaybooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(ownerId: string) {
    return this.prisma.playbook.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
      include: { sections: { orderBy: { sortOrder: 'asc' }, include: { nodes: { orderBy: { sortOrder: 'asc' } } } } },
    });
  }

  async findOne(ownerId: string, id: string) {
    const playbook = await this.prisma.playbook.findFirst({
      where: { id, ownerId },
      include: { sections: { orderBy: { sortOrder: 'asc' }, include: { nodes: { orderBy: { sortOrder: 'asc' } } } } },
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
          ? { create: dto.nodes.map((node) => ({ ...node, suggestedQuestion: node.suggestedQuestion ?? '', type: node.type ?? 'SCRIPT', sortOrder: node.sortOrder ?? 0 })) }
          : undefined,
      },
      include: { nodes: true },
    });
  }
}
