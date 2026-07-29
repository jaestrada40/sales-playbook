import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../auth/jwt-auth.guard';
import {
  ComplianceDto,
  CreateCampaignDto,
  CreateTaskDto,
  CreateTeamDto,
  DncDto,
  ImportProspectsDto,
  UpdateProspectDto,
  UpdateTeamMemberDto,
} from './dto/operations.dto';
import { OperationsService } from './operations.service';

@Controller('operations')
@UseGuards(JwtAuthGuard)
export class OperationsController {
  constructor(private readonly operations: OperationsService) {}

  @Get('overview') overview(@Request() req: AuthenticatedRequest) {
    return this.operations.overview(req.user);
  }
  @Get('prospects') prospects(@Request() req: AuthenticatedRequest) {
    return this.operations.prospects(req.user);
  }
  @Post('prospects/import') importProspects(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ImportProspectsDto,
  ) {
    return this.operations.importProspects(req.user, dto);
  }
  @Patch('prospects/:id') updateProspect(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateProspectDto,
  ) {
    return this.operations.updateProspect(req.user, id, dto);
  }
  @Get('campaigns') campaigns(@Request() req: AuthenticatedRequest) {
    return this.operations.campaigns(req.user);
  }
  @Post('campaigns') createCampaign(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.operations.createCampaign(req.user, dto);
  }
  @Get('team') team(@Request() req: AuthenticatedRequest) {
    return this.operations.team(req.user);
  }
  @Post('team') createTeam(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateTeamDto,
  ) {
    return this.operations.createTeam(req.user, dto);
  }
  @Patch('team/users/:id') updateTeamMember(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.operations.updateTeamMember(req.user, id, dto);
  }
  @Get('compliance') compliance() {
    return this.operations.compliance();
  }
  @Put('compliance') updateCompliance(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ComplianceDto,
  ) {
    return this.operations.updateCompliance(req.user, dto);
  }
  @Post('compliance/purge') purgeExpired(@Request() req: AuthenticatedRequest) {
    return this.operations.purgeExpired(req.user);
  }
  @Post('dnc') addDnc(
    @Request() req: AuthenticatedRequest,
    @Body() dto: DncDto,
  ) {
    return this.operations.addDnc(req.user, dto);
  }
  @Get('audit') audit(@Request() req: AuthenticatedRequest) {
    return this.operations.audit(req.user);
  }
  @Post('tasks') createTask(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateTaskDto,
  ) {
    return this.operations.createTask(req.user, dto);
  }
  @Patch('tasks/:id/complete') completeTask(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.operations.completeTask(req.user, id);
  }
}
