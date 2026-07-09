import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RefreshTokenService {
  constructor(private prisma: PrismaService) {}

  async create(data: { token: string; userId: number; expiresAt: Date }) {
    // Sessioni multiple: NON cancelliamo i token esistenti dell'utente,
    // così restano valide le sessioni sugli altri device.
    return this.prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        expiresAt: data.expiresAt,
        isRevoked: false,
        createdAt: new Date(),
      },
    });
  }

  async findByToken(token: string) {
    return this.prisma.refreshToken.findFirst({
      where: {
        token: token,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async revokeByUserId(userId: number) {
    return this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });
  }

  async revokeByToken(token: string) {
    return this.prisma.refreshToken.updateMany({
      where: { token: token },
      data: {
        isRevoked: true,
      },
    });
  }
}
