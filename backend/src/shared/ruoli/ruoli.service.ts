import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { nuovoRuoloDto } from './dto/ruoli.dto';

@Injectable()
export class RuoliService {
  constructor(private prisma: PrismaService) {}

  async getRuoli() {
    return await this.prisma.ruolo.findMany();
  }

  async addRuolo(body: nuovoRuoloDto) {
    const { nome, permessi } = body;

    const newRuolo = await this.prisma.ruolo.create({
      data: {
        nome,
        permessi,
        createdAt: new Date(),
      },
    });
    return newRuolo;
  }

  async updateRuolo(id: number, body: nuovoRuoloDto) {
    const { nome, permessi } = body;

    const updatedRuolo = await this.prisma.ruolo.update({
      where: { id },
      data: {
        nome,
        permessi,
      },
    });

    return updatedRuolo;
  }

  async deleteRuolo(id: number) {
    const deleted = await this.prisma.ruolo.delete({
      where: { id },
    });

    return deleted;
  }
}
