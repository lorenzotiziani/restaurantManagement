import { Module } from '@nestjs/common';
import { RuoliService } from './ruoli.service';
import { PrismaModule } from 'prisma/prisma.module';
import { RuoliController } from './ruoli.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RuoliController],
  providers: [RuoliService],
  exports: [RuoliService],
})
export class RuoliModule {}
