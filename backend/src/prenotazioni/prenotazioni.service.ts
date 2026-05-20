import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePrenotazioneDto } from './dto/create-prenotazioni.dto';
import { UpdatePrenotazioniDto } from './dto/update-prenotazioni.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Prenotazione } from '@prisma/client';

@Injectable()
export class PrenotazioniService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.prenotazione.findMany();
  }

  async findOne(id: number) {
    const prenotazione = await this.prisma.prenotazione.findUnique({
      where: { id: id },
    });

    if (!prenotazione) {
      throw new NotFoundException(`prenotazione con id ${id} non presente`);
    }

    return prenotazione;
  }

  async findMany(nominativo: string, telefono: string) {
    const prenotazioniByExample = await this.prisma.prenotazione.findMany({
      where: {
        nominativo: nominativo,
        telefono: telefono,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prenotazioniByExample;
  }

  async findLast(nominativo: string, telefono: string) {
    const prenotazioniByExample =
      await this.prisma.prenotazione.findFirstOrThrow({
        where: {
          nominativo: nominativo,
          telefono: telefono,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return prenotazioniByExample;
  }

  async create(dto: CreatePrenotazioneDto) {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { id: { in: dto.items.map((i) => i.menuItemId) } },
      include: { ingredienti: true },
    });

    let totale = 0;
    for (const item of dto.items) {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem)
        throw new BadRequestException(
          `MenuItem ${item.menuItemId} non trovato`,
        );

      // prezzo base * quantità
      totale += Number(menuItem.prezzo) * item.quantita;

      // aggiungi costo delle aggiunte
      for (const aggiunta of item.aggiunte ?? []) {
        const ingrediente = await this.prisma.ingrediente.findUnique({
          where: { id: aggiunta.ingredienteId },
        });
        totale += Number(ingrediente!.prezzo) * item.quantita;
      }
    }
    return await this.prisma.$transaction(async (tx) => {
      const prenotazione = await tx.prenotazione.create({
        data: {
          nominativo: dto.nominativo,
          telefono: dto.telefono,
          modalita: dto.modalita,
          stato: dto.stato,
          note: dto.note,
          totale: totale,
          giornoPrenotazione: dto.giornoPrenotazione,
          fasciaOrariaId: dto.fasciaOrariaId,
          via: dto.via,
          civico: dto.civico,
          citta: dto.citta,
          noteIndirizzo: dto.noteIndirizzo,

          items: {
            create: dto.items.map((item) => {
              const menuItem = menuItems.find((m) => m.id === item.menuItemId);
              return {
                menuItemId: menuItem!.id,
                nomeSnapshot: menuItem!.nome,
                prezzoSnapshot: menuItem!.prezzo,
                categoriaSnapshot: menuItem!.categoria,
                quantita: item.quantita,
                note: item.note,
                aggiunte: {
                  create: (item.aggiunte ?? []).map((a) => ({
                    ingredienteId: a.ingredienteId,
                    prezzoSnapshot: 0,
                  })),
                },
                rimozioni: {
                  create: (item.rimozioni ?? []).map((r) => ({
                    ingredienteId: r.ingredienteId,
                  })),
                },
              };
            }),
          },

          pagamento: {
            create: {
              metodo: dto.pagamento.metodo,
              pagato: false,
            },
          },
        },
        include: {
          items: {
            include: { aggiunte: true, rimozioni: true },
          },
          pagamento: true,
          fasciaOraria: true,
        },
      });

      return prenotazione;
    });
  }

  async update(id: number, dto: UpdatePrenotazioniDto) {
    const prenotazione = await this.prisma.prenotazione.findUnique({
      where: { id },
    });

    if (!prenotazione)
      throw new NotFoundException(`Prenotazione ${id} non trovata`);

    if (prenotazione.stato !== 'RICEVUTA') {
      throw new BadRequestException(
        'Puoi modificare solo prenotazioni in stato RICEVUTA',
      );
    }

    await this.isModificabile(prenotazione);

    // Estrai solo i campi scalari, escludi pagamento e items
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pagamento, items, ...others } = dto;

    return await this.prisma.prenotazione.update({
      where: { id: id },
      data: {
        nominativo: others.nominativo,
        telefono: others.telefono,
        modalita: others.modalita,
        stato: others.stato,
        note: others.note,
        giornoPrenotazione: others.giornoPrenotazione,
        fasciaOrariaId: others.fasciaOrariaId,
        via: others.via,
        civico: others.civico,
        citta: others.citta,
        noteIndirizzo: others.noteIndirizzo,
      },
      include: {
        items: { include: { aggiunte: true, rimozioni: true } },
        pagamento: true,
        fasciaOraria: true,
      },
    });
  }

  async remove(id: number) {
    //cancello il pagamento collegato alla prenotazione
    await this.prisma.pagamento.deleteMany({
      where: {
        prenotazioneId: id,
      },
    });

    //cancello l'ordine relativo alla prenotazione
    await this.prisma.ordineItem.deleteMany({
      where: {
        prenotazioneId: id,
      },
    });

    //cancello la prenotazione effettiva
    const deleted = await this.prisma.prenotazione.delete({
      where: {
        id: id,
      },
    });

    return deleted;
  }
  private async isModificabile(prenotazione: Prenotazione): Promise<void> {
    const fascia = await this.prisma.fasciaOraria.findUnique({
      where: { id: prenotazione.fasciaOrariaId },
    });

    if (!fascia) throw new NotFoundException('Fascia oraria non trovata');

    const [ore, minuti] = fascia.orario.split(':').map(Number);
    const orarioConsegna = new Date(prenotazione.giornoPrenotazione);
    orarioConsegna.setHours(ore, minuti, 0, 0);

    const minutiMancanti =
      (orarioConsegna.getTime() - new Date().getTime()) / 1000 / 60;

    if (minutiMancanti < 20) {
      throw new BadRequestException(
        "Non è possibile modificare la prenotazione a meno di 20 minuti dall'orario di consegna",
      );
    }
  }

  async assignFattorino(prenotazioneId: number, fattorinoId: number) {
    const prenotazione = await this.prisma.prenotazione.findUnique({
      where: { id: prenotazioneId, modalita: 'DOMICILIO' },
    });
    if (!prenotazione)
      throw new NotFoundException(
        'Prenotazione non trovata o non è una prenotazione domiciliaria',
      );

    const fattorino = await this.prisma.user.findUnique({
      where: { id: fattorinoId, ruoloId: 4 },
    });
    if (!fattorino) throw new NotFoundException('Fattorino non trovato');

    const updated = await this.prisma.prenotazione.update({
      where: { id: prenotazioneId },
      data: { fattorinoId },
    });

    return updated;
  }
}


