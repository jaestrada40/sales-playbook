import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCallDto {
  @IsString()
  playbookId!: string;

  @IsOptional()
  @IsString()
  prospectName?: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}

export class FinishCallDto {
  @IsString()
  outcome!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;
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
