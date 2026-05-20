import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { nuovoIngredienteDto } from './dto/ingrediente.dto';

@Injectable()
export class IngredienteService {
  constructor(private prisma: PrismaService) {}

  async getIngredienti() {
    return await this.prisma.ingrediente.findMany();
  }

  async addIngrediente(body: nuovoIngredienteDto) {
    const { nome, prezzo, diponibile } = body;

    const newIngrediente = await this.prisma.ingrediente.create({
      data: {
        nome: nome,
        prezzo: prezzo,
        disponibile: diponibile,
        createdAt: new Date(),
      },
    });
    return newIngrediente;
  }

  async updateIngrediente(id: number, body: nuovoIngredienteDto) {
    const { nome, prezzo, diponibile } = body;

    const updatedIngrediente = await this.prisma.ingrediente.update({
      where: { id: id },
      data: {
        nome: nome,
        prezzo: prezzo,
        disponibile: diponibile,
      },
    });

    return updatedIngrediente;
  }

  async deleteIngrediente(id: number) {
    const deleted = await this.prisma.ingrediente.delete({
      where: { id: id },
    });

    return deleted;
  }
}
