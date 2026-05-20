import { Module } from '@nestjs/common';
import { IngredienteService } from './ingrediente.service';
import { PrismaModule } from 'prisma/prisma.module';
import { IngredienteController } from './ingrediente.controller';

@Module({
  imports: [PrismaModule],
  controllers: [IngredienteController],
  providers: [IngredienteService],
  exports: [IngredienteService],
})
export class IngredienteModule {}
