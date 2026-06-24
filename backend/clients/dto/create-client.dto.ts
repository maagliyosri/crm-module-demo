import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ClientType } from '@prisma/client';

export class CreateClientDto {
  @IsEnum(ClientType)
  type: ClientType;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Entreprise
  @ValidateIf((o) => o.type === ClientType.COMPANY)
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  siret?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactRole?: string;

  // Particulier
  @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
  @IsString()
  firstName?: string;

  @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
  @IsString()
  lastName?: string;
}