import { Module } from '@nestjs/common';
import { FasceOrarieModule } from './fasceOrarie/fasceOrarie.module';
import { PagamentoModule } from './pagamento/pagamento.module';

@Module({
  imports: [FasceOrarieModule, PagamentoModule],
  exports: [FasceOrarieModule, PagamentoModule],
})
export class SharedModule {}
