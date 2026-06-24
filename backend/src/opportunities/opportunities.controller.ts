import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { PipelineStage, ClientType } from '@prisma/client';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  create(@Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(dto);
  }

  @Get()
  findAll(
    @Query('stage') stage?: PipelineStage,
    @Query('clientType') clientType?: ClientType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.opportunitiesService.findAll({
      stage,
      clientType,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('pipeline')
  getPipelineSummary() {
    return this.opportunitiesService.getPipelineSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.opportunitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.opportunitiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.opportunitiesService.remove(id);
  }
}