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
import { nuovoIngredienteSchema } from './dto/ingrediente.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';

@UseGuards(AuthGuard('jwt'))
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

  @Post()
  async createIngrediente(
    @Body(new ZodValidationPipe(nuovoIngredienteSchema))
    body: z.infer<typeof nuovoIngredienteSchema>,
  ) {
    const nuovoIngrediente = await this.ingredienteService.addIngrediente(body);

    return {
      message: 'success',
      data: nuovoIngrediente,
    };
  }

  @Patch(':id')
  async updateIngrediente(
    @Param('id') id: number,
    @Body(new ZodValidationPipe(nuovoIngredienteSchema))
    body: z.infer<typeof nuovoIngredienteSchema>,
  ) {
    const updated = await this.ingredienteService.updateIngrediente(id, body);
    return {
      message: 'success',
      data: updated,
    };
  }

  @Delete(':id')
  async deleteRuolo(@Param('id') id: number) {
    await this.ingredienteService.deleteIngrediente(id);
    return {
      message: 'success',
    };
  }
}
