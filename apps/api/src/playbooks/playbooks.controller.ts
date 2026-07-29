import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../auth/jwt-auth.guard';
import {
  AddSectionDto,
  CreatePlaybookDto,
  UpdatePlaybookDto,
} from './dto/playbook.dto';
import { PlaybooksService } from './playbooks.service';

@Controller('playbooks')
@UseGuards(JwtAuthGuard)
export class PlaybooksController {
  constructor(private readonly playbooks: PlaybooksService) {}

  @Get()
  findAll(@Request() request: AuthenticatedRequest) {
    return this.playbooks.findAll(request.user.sub);
  }

  @Get(':id')
  findOne(@Request() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.playbooks.findOne(request.user.sub, id);
  }

  @Post()
  create(
    @Request() request: AuthenticatedRequest,
    @Body() dto: CreatePlaybookDto,
  ) {
    return this.playbooks.create(request.user.sub, dto);
  }

  @Post(':id/sections')
  addSection(
    @Request() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: AddSectionDto,
  ) {
    return this.playbooks.addSection(request.user.sub, id, dto);
  }

  @Put(':id')
  update(
    @Request() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePlaybookDto,
  ) {
    return this.playbooks.update(request.user.sub, id, dto);
  }
}
