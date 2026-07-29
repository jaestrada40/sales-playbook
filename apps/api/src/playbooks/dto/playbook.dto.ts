import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreatePlaybookDto {
  @IsString()
  @MinLength(1)
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
  @IsOptional()
  @IsString()
  id?: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBranchDto)
  branches?: CreateBranchDto[];
}

export class CreateBranchDto {
  @IsString()
  customerResponse!: string;

  @IsString()
  targetNodeId!: string;
}

export class AddSectionDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNodeDto)
  nodes?: CreateNodeDto[];
}

export class UpdatePlaybookDto extends CreatePlaybookDto {
  @IsString()
  version!: string;

  @IsIn(['DRAFT', 'REVIEW', 'PUBLISHED'])
  status!: 'DRAFT' | 'REVIEW' | 'PUBLISHED';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddSectionDto)
  sections!: AddSectionDto[];
}
