import { Module } from '@nestjs/common';
import { MenuItemsService } from './menuItems.service';
import { PrismaModule } from 'prisma/prisma.module';
import { MenuItemsController } from './menuItems.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
