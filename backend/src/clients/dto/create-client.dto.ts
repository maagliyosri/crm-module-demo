import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ClientType } from '@prisma/client';

export class CreateClientDto {
  @IsEnum(ClientType)
  type: ClientType;

  @IsEmail({}, { message: "L'email n'est pas valide" })
  email: string;

  @IsOptional()
  @Matches(/^[+\d][\d\s\-().]{6,19}$/, {
    message: 'Le numéro de téléphone n\'est pas valide (ex: +216 12 345 678)',
  })
  phone?: string;

  // Entreprise
  @ValidateIf((o) => o.type === ClientType.COMPANY)
  @IsString({ message: 'La raison sociale est obligatoire pour une entreprise' })
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
  @IsString({ message: 'Le prénom est obligatoire pour un particulier' })
  firstName?: string;

  @ValidateIf((o) => o.type === ClientType.INDIVIDUAL)
  @IsString({ message: 'Le nom est obligatoire pour un particulier' })
  lastName?: string;
}