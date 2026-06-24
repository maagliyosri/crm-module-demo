import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';

@Module({
  imports: [PrismaModule, ClientsModule, OpportunitiesModule],
})
export class AppModule {}