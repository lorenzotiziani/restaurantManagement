import { Module } from '@nestjs/common';
import { FasceOrarieService } from './fasceOrarie.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FasceOrarieService],
  exports: [FasceOrarieService],
})
export class FasceOrarieModule {}
