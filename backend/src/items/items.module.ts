import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuditLogsModule, PrismaModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
