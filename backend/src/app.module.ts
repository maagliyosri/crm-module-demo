import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import { PrismaModule } from './prisma/prisma.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { PipelineModule } from './pipeline/pipeline.module';
@Module({
  imports: [PrismaModule, ClientsModule, OpportunitiesModule, PipelineModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
