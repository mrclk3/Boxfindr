import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CabinetsModule } from './cabinets/cabinets.module';
import { CratesModule } from './crates/crates.module';
import { AuditLogsService } from './audit-logs/audit-logs.service';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    PrismaModule,
    CabinetsModule,
    CratesModule,
    CategoriesModule,
    ItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuditLogsService],
})
export class AppModule { }
