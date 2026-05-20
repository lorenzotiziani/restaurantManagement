import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class PagamentoService {
  constructor(private prisma: PrismaService) {}

  //PAGAMENTO
  async updatePagamento(prenotazioneId: number) {
    const prenotazione = await this.prisma.prenotazione.findUnique({
      where: { id: prenotazioneId },
      include: { pagamento: true },
    });

    if (!prenotazione)
      throw new NotFoundException(`Prenotazione ${prenotazioneId} non trovata`);

    if (!prenotazione.pagamento)
      throw new NotFoundException('Pagamento non trovato');

    if (prenotazione.pagamento.pagato)
      throw new BadRequestException('Il pagamento è già stato registrato');

    return await this.prisma.prenotazione.update({
      where: { id: prenotazioneId },
      data: {
        pagamento: {
          update: {
            pagato: true,
          },
        },
      },
      include: { pagamento: true },
    });
  }
}
