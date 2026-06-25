import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientType, Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    try {
      return await this.prisma.client.create({
        data: {
          type: dto.type,
          email: dto.email,
          phone: dto.phone,
          companyName: dto.companyName,
          siret: dto.siret,
          contactName: dto.contactName,
          contactRole: dto.contactRole,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Un client avec cet email existe déjà');
      }
      throw e;
    }
  }

  async findAll(type?: ClientType) {
    return this.prisma.client.findMany({
      where: type ? { type } : undefined,
      include: { opportunities: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { opportunities: true },
    });
    if (!client) throw new NotFoundException(`Client ${id} introuvable`);
    return client;
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);
    try {
      return await this.prisma.client.update({ where: { id }, data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Un client avec cet email existe déjà');
      }
      throw e;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.delete({ where: { id } });
  }
}