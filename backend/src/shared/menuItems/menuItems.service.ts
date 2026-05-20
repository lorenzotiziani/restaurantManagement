import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { nuovoMenuItemsDto } from './dto/menuItems.dto';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async getMenuItems() {
    return await this.prisma.menuItem.findMany();
  }

  async addMenuItem(body: nuovoMenuItemsDto) {
    const { nome, descrizione, categoria, prezzo, disponibile } = body;

    const newMenuItem = await this.prisma.menuItem.create({
      data: {
        nome: nome,
        descrizione: descrizione,
        categoria: categoria,
        prezzo: prezzo,
        disponibile: disponibile,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const items = descrizione.split(',');

    await Promise.all(
      items.map(async (item) => {
        const ingrediente = await this.prisma.ingrediente.findFirst({
          where: {
            nome: item.trim(),
          },
        });

        if (ingrediente) {
          await this.prisma.menuItemIngredienti.create({
            data: {
              menuItemId: newMenuItem.id,
              ingredienteId: ingrediente.id,
            },
          });
        }
      }),
    );

    return newMenuItem;
  }

  async updateMenuItem(id: number, body: nuovoMenuItemsDto) {
    const { nome, descrizione, categoria, prezzo, disponibile } = body;

    const updatedMenuItem = await this.prisma.menuItem.update({
      where: { id: id },
      data: {
        nome: nome,
        descrizione: descrizione,
        categoria: categoria,
        prezzo: prezzo,
        disponibile: disponibile,
        updatedAt: new Date(),
      },
    });

    return updatedMenuItem;
  }

  async deleteMenuItem(id: number) {
    const deleted = await this.prisma.menuItem.delete({
      where: { id: id },
    });

    return deleted;
  }
}
