import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCallDto, FinishCallDto } from './dto/call.dto';

@Injectable()
export class CallsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateCallDto) {
    const playbook = await this.prisma.playbook.findFirst({ where: { id: dto.playbookId, ownerId } });
    if (!playbook) throw new NotFoundException('Playbook no encontrado');
    return this.prisma.call.create({ data: { ownerId, playbookId: dto.playbookId, prospectName: dto.prospectName ?? '', businessName: dto.businessName ?? '' } });
  }

  async finish(ownerId: string, id: string, dto: FinishCallDto) {
    const call = await this.prisma.call.findFirst({ where: { id, ownerId } });
    if (!call) throw new NotFoundException('Llamada no encontrada');
    return this.prisma.call.update({ where: { id }, data: { endedAt: new Date(), outcome: dto.outcome, notes: dto.notes ?? '', durationSeconds: dto.durationSeconds ?? call.durationSeconds } });
  }

  findAll(ownerId: string) {
    return this.prisma.call.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' }, include: { playbook: true } });
  }
}
