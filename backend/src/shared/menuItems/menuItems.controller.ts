import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MenuItemsService } from './menuItems.service';
import { nuovoMenuItemsDto } from './dto/menuItems.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  async getMenuItems() {
    const all = await this.menuItemsService.getMenuItems();

    return {
      message: 'success',
      data: all,
    };
  }

  @Roles('cassa')
  @Post()
  async createMenuItems(
    @Body(new ZodValidationPipe(nuovoMenuItemsDto))
    body: nuovoMenuItemsDto,
  ) {
    const nuovoMenuItems = await this.menuItemsService.addMenuItem(body);

    return {
      message: 'success',
      data: nuovoMenuItems,
    };
  }

  @Roles('cassa')
  @Patch(':id')
  async updateMenuItems(
    @Param('id') id: number,
    @Body(new ZodValidationPipe(nuovoMenuItemsDto))
    body: nuovoMenuItemsDto,
  ) {
    const updated = await this.menuItemsService.updateMenuItem(id, body);
    return {
      message: 'success',
      data: updated,
    };
  }

  @Roles('cassa')
  @Delete(':id')
  async deleteMenuItems(@Param('id') id: number) {
    await this.menuItemsService.deleteMenuItem(id);
    return {
      message: 'success',
    };
  }
}
