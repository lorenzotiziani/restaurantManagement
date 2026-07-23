import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { User, userView } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        ...createUserDto,
        attivo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany();
    return users.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ password, ...userWithoutPassword }) => userWithoutPassword,
    );
  }

  async findOne(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { ruolo: { select: { nome: true } } },
    });

    if (!user) {
      throw new NotFoundException(`Utente con ID ${id} non trovato`);
    }

    return user;
  }

  async findOneView(id: number): Promise<userView | null> {
    const user = await this.prisma.utenteRuoloView.findUnique({
      where: { id: id },
    });

    if (!user) {
      throw new NotFoundException(`Utente con ID ${id} non trovato`);
    }

    return user;
  }

  // Ritorna l'utente COMPLETO (password inclusa): serve all'auth per il
  // confronto bcrypt. Chi la espone via HTTP deve rimuovere la password.
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      include: { ruolo: { select: { nome: true } } },
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'> | null> {
    // confirmPassword serve solo alla validazione, non è una colonna del DB
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...dataToSave } = updateUserDto;

    if (dataToSave.password) {
      dataToSave.password = await bcrypt.hash(dataToSave.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dataToSave,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPsw } = updated;

    return userWithoutPsw;
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Utente ${id} eliminato`,
    };
  }
}
