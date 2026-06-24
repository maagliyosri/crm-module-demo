import { Controller, Get } from '@nestjs/common';
import { OpportunitiesService } from '../opportunities/opportunities.service';

@Controller('pipeline')
export class PipelineController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get('summary')
  getSummary() {
    return this.opportunitiesService.getPipelineSummary();
  }
}