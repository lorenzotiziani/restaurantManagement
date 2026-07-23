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
import { IngredienteService } from './ingrediente.service';
import { nuovoIngredienteDto } from './dto/ingrediente.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('ingrediente')
export class IngredienteController {
  constructor(private readonly ingredienteService: IngredienteService) {}

  @Get()
  async getIngredienti() {
    const all = await this.ingredienteService.getIngredienti();
    return {
      message: 'success',
      data: all,
    };
  }

  @Roles('cassa')
  @Post()
  async createIngrediente(
    @Body(new ZodValidationPipe(nuovoIngredienteDto))
    body: nuovoIngredienteDto,
  ) {
    const nuovoIngrediente = await this.ingredienteService.addIngrediente(body);

    return {
      message: 'success',
      data: nuovoIngrediente,
    };
  }

  @Roles('cassa')
  @Patch(':id')
  async updateIngrediente(
    @Param('id') id: number,
    @Body(new ZodValidationPipe(nuovoIngredienteDto))
    body: nuovoIngredienteDto,
  ) {
    const updated = await this.ingredienteService.updateIngrediente(id, body);
    return {
      message: 'success',
      data: updated,
    };
  }

  @Roles('cassa')
  @Delete(':id')
  async deleteRuolo(@Param('id') id: number) {
    await this.ingredienteService.deleteIngrediente(id);
    return {
      message: 'success',
    };
  }
}
