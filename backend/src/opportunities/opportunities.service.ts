import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { PipelineStage, ClientType } from '@prisma/client';

const STALE_DAYS = 14;

function isAtRisk(opp: {
  expectedCloseDate: Date;
  updatedAt: Date;
  stage: PipelineStage;
}): boolean {
  if (opp.stage === PipelineStage.WON || opp.stage === PipelineStage.LOST)
    return false;

  const now = new Date();

  // En retard : date prévue dépassée
  if (opp.expectedCloseDate < now) return true;

  // Stagnante : pas de mise à jour depuis 14 jours
  const daysSinceUpdate =
    (now.getTime() - opp.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate > STALE_DAYS) return true;

  return false;
}

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOpportunityDto) {
    return this.prisma.opportunity.create({
      data: {
        ...dto,
        expectedCloseDate: new Date(dto.expectedCloseDate),
      },
      include: { client: true },
    });
  }

  async findAll(filters: {
    stage?: PipelineStage;
    clientType?: ClientType;
    page?: number;
    limit?: number;
  }) {
    const { stage, clientType, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(stage ? { stage } : {}),
      ...(clientType ? { client: { type: clientType } } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.opportunity.count({ where }),
      this.prisma.opportunity.findMany({
        where,
        include: { client: true },
        orderBy: { expectedCloseDate: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: items.map((opp) => ({ ...opp, isAtRisk: isAtRisk(opp) })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const opp = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!opp) throw new NotFoundException(`Opportunité ${id} introuvable`);
    return { ...opp, isAtRisk: isAtRisk(opp) };
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    await this.findOne(id);
    return this.prisma.opportunity.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.expectedCloseDate
          ? { expectedCloseDate: new Date(dto.expectedCloseDate) }
          : {}),
      },
      include: { client: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.opportunity.delete({ where: { id } });
  }

  async getPipelineSummary() {
    const opportunities = await this.prisma.opportunity.findMany({
      where: {
        stage: { notIn: [PipelineStage.WON, PipelineStage.LOST] },
      },
    });

    const allOpps = await this.prisma.opportunity.findMany();
    const won = allOpps.filter((o) => o.stage === PipelineStage.WON);
    const closed = allOpps.filter(
      (o) => o.stage === PipelineStage.WON || o.stage === PipelineStage.LOST,
    );

    const byStage = Object.values(PipelineStage).map((stage) => {
      const items = opportunities.filter((o) => o.stage === stage);
      return {
        stage,
        count: items.length,
        total: items.reduce((sum, o) => sum + Number(o.amount), 0),
      };
    });

    const atRisk = opportunities.filter((o) => isAtRisk(o)).length;
    const pipelineTotal = opportunities.reduce(
      (sum, o) => sum + Number(o.amount),
      0,
    );
    const conversionRate =
      closed.length > 0
        ? Math.round((won.length / closed.length) * 100)
        : 0;

    return { pipelineTotal, byStage, atRisk, conversionRate };
  }
}