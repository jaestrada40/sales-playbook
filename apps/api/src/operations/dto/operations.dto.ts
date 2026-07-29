import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProspectInputDto {
  @IsString() businessName!: string;
  @IsString() contactName!: string;
  @IsString() phone!: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() role?: string;
  @IsOptional() @IsString() businessType?: string;
  @IsOptional() @IsString() currentProvider?: string;
  @IsOptional() @IsNumber() @Min(0) monthlyVolumeUSD?: number;
  @IsOptional() @IsInt() @Min(0) terminalCount?: number;
  @IsOptional() @IsString() objective?: string;
  @IsOptional() @IsString() mainPainPoint?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class ImportProspectsDto {
  @IsString() campaignId!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProspectInputDto)
  prospects!: ProspectInputDto[];
}

export class CreateCampaignDto {
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsString() teamId!: string;
  @IsOptional() @IsString() managerId?: string;
  @IsOptional() @IsString() playbookId?: string;
  @IsOptional() @IsInt() @Min(1) dailyCallGoal?: number;
  @IsOptional() @IsIn(['INBOUND', 'OUTBOUND']) direction?: string;
}

export class UpdateProspectDto {
  @IsOptional() @IsString() assigneeId?: string;
  @IsOptional()
  @IsIn(['NEW', 'ASSIGNED', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST', 'DNC'])
  status?: string;
  @IsOptional() @IsBoolean() doNotCall?: boolean;
  @IsOptional()
  @IsIn(['UNKNOWN', 'PENDING', 'GRANTED', 'DENIED'])
  consentStatus?: string;
  @IsOptional() @IsString() consentSource?: string;
  @IsOptional()
  @IsIn(['DISCOVERY', 'PROPOSAL', 'FOLLOW_UP', 'WON', 'LOST'])
  opportunityStage?: string;
  @IsOptional() @IsNumber() @Min(0) estimatedValue?: number;
}

export class ComplianceDto {
  @IsString() jurisdiction!: string;
  @IsString() timezone!: string;
  @IsInt() @Min(0) @Max(23) callingStartHour!: number;
  @IsInt() @Min(1) @Max(24) callingEndHour!: number;
  @IsInt() @Min(1) retentionDays!: number;
  @IsBoolean() requireConsent!: boolean;
}

export class DncDto {
  @IsString() phone!: string;
  @IsString() reason!: string;
}

export class CreateTaskDto {
  @IsString() title!: string;
  @IsDateString() dueAt!: string;
  @IsString() ownerId!: string;
  @IsOptional() @IsString() prospectId?: string;
}

export class CreateTeamDto {
  @IsString() name!: string;
}

export class UpdateTeamMemberDto {
  @IsString() teamId!: string;
  @IsIn(['ADMIN', 'MANAGER', 'SELLER']) role!: string;
}
