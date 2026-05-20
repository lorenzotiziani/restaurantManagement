import { Module } from '@nestjs/common';
import { PagamentoService } from './pagamento.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PagamentoService],
  exports: [PagamentoService],
})
export class PagamentoModule {}
