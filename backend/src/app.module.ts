import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrenotazioniModule } from './prenotazioni/prenotazioni.module';
import { RuoliModule } from './shared/ruoli/ruoli.module';
import { IngredienteModule } from './shared/ingrediente/ingrediente.module';
import { MenuItemsModule } from './shared/menuItems/menuItems.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    PrenotazioniModule,
    RuoliModule,
    IngredienteModule,
    MenuItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
