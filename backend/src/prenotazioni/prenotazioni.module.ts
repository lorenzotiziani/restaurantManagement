import { Module } from '@nestjs/common';
import { PrenotazioniService } from './prenotazioni.service';
import { PrenotazioniController } from './prenotazioni.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [PrismaModule, SharedModule],
  controllers: [PrenotazioniController],
  providers: [PrenotazioniService],
})
export class PrenotazioniModule {}
