import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { FindAvailableDto } from './dto/fasceOrarie.dto';

@Injectable()
export class FasceOrarieService {
  constructor(private prisma: PrismaService) {}

  async findAvailable(body: FindAvailableDto) {
    try {
      const giorno = body.giorno ? new Date(body.giorno) : new Date();
      const now = new Date();
      const isOggi = giorno.toDateString() === now.toDateString();

      //cerco tutte le fasce orarie attive
      const fasce = await this.prisma.fasciaOraria.findMany({
        where: { attiva: true },
      });

      const result = await Promise.all(
        fasce.map(async (fascia) => {
          const [ore, minuti] = fascia.orario.split(':').map(Number);
          const orarioFascia = new Date(giorno);
          orarioFascia.setHours(ore, minuti, 0, 0);

          // Salta le fasce passate se è oggi
          if (isOggi && orarioFascia <= now) return null;

          // Salta le fasce prima dell'orario minimo richiesto
          if (body.orarioDa) {
            const [oreMin, minutiMin] = body.orarioDa.split(':').map(Number);
            const orarioMinimo = new Date(giorno);
            orarioMinimo.setHours(oreMin, minutiMin, 0, 0);
            if (orarioFascia < orarioMinimo) return null;
          }

          const inizioGiorno = new Date(giorno);
          inizioGiorno.setHours(0, 0, 0, 0);
          const fineGiorno = new Date(giorno);
          fineGiorno.setHours(23, 59, 59, 999);

          const ordiniEsistenti = await this.prisma.prenotazione.count({
            where: {
              fasciaOrariaId: fascia.id,
              giornoPrenotazione: { gte: inizioGiorno, lte: fineGiorno },
              stato: { notIn: ['ANNULLATA'] },
            },
          });

          const postiDisponibili = fascia.maxOrdini - ordiniEsistenti;
          if (postiDisponibili < (body.numeroPizze ?? 1)) return null;

          return { ...fascia, postiDisponibili };
        }),
      );

      return result.filter(Boolean);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
