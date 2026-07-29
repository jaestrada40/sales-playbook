import {
  IsDateString,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCallDto {
  @IsString()
  playbookId!: string;

  @IsOptional()
  @IsString()
  prospectName?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  prospectId?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsBoolean()
  consentConfirmed?: boolean;
}

export class FinishCallDto {
  @IsString()
  @IsIn([
    'no_contesto',
    'no_interesado',
    'seguimiento',
    'interesado',
    'cita_agendada',
  ])
  outcome!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsOptional()
  @IsDateString()
  followUpAt?: string;
}

export class UpdateCallDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}
