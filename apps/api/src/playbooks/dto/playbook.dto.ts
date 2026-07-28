import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlaybookDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  industry?: string;
}

export class CreateNodeDto {
  @IsString()
  title!: string;

  @IsString()
  script!: string;

  @IsOptional()
  @IsString()
  suggestedQuestion?: string;

  @IsOptional()
  @IsIn(['SCRIPT', 'QUESTION', 'ANSWER', 'OBJECTION', 'OUTCOME'])
  type?: 'SCRIPT' | 'QUESTION' | 'ANSWER' | 'OBJECTION' | 'OUTCOME';

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class AddSectionDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  nodes?: CreateNodeDto[];
}
