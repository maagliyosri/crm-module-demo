import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { OpportunitiesModule } from '../opportunities/opportunities.module';

@Module({
  imports: [OpportunitiesModule],
  controllers: [PipelineController],
})
export class PipelineModule {}