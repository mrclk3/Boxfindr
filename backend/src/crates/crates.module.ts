import { Module } from '@nestjs/common';
import { CratesService } from './crates.service';
import { CratesController } from './crates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CratesController],
  providers: [CratesService],
})
export class CratesModule {}
