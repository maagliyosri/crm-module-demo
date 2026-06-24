import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';

@Module({
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],  // ← add this
})
export class OpportunitiesModule {}