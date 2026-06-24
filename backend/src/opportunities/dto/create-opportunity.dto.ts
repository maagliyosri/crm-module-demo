import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { PipelineStage } from '@prisma/client';

export class CreateOpportunityDto {
  @IsString()
  title: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  expectedCloseDate: string;

  @IsEnum(PipelineStage)
  @IsOptional()
  stage?: PipelineStage;

  @IsString()
  clientId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}