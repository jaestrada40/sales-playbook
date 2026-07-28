import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, type AuthenticatedRequest } from '../auth/jwt-auth.guard';
import { CreateCallDto, FinishCallDto } from './dto/call.dto';
import { CallsService } from './calls.service';

@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallsController {
  constructor(private readonly calls: CallsService) {}

  @Get()
  findAll(@Request() request: AuthenticatedRequest) { return this.calls.findAll(request.user.sub); }

  @Post()
  create(@Request() request: AuthenticatedRequest, @Body() dto: CreateCallDto) { return this.calls.create(request.user.sub, dto); }

  @Post(':id/finish')
  finish(@Request() request: AuthenticatedRequest, @Param('id') id: string, @Body() dto: FinishCallDto) { return this.calls.finish(request.user.sub, id, dto); }
}
