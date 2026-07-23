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
import { RuoliService } from './ruoli.service';
import { nuovoRuoloDto } from './dto/ruoli.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('cassa')
@Controller('ruoli')
export class RuoliController {
  constructor(private readonly ruoliService: RuoliService) {}

  @Get()
  async getRuoli() {
    const all = await this.ruoliService.getRuoli();
    return {
      message: 'success',
      data: all,
    };
  }

  @Post()
  async createRuolo(
    @Body(new ZodValidationPipe(nuovoRuoloDto))
    body: nuovoRuoloDto,
  ) {
    const nuovoRuolo = await this.ruoliService.addRuolo(body);

    return {
      message: 'success',
      data: nuovoRuolo,
    };
  }

  @Patch(':id')
  async updateRuolo(
    @Param('id') id: number,
    @Body(new ZodValidationPipe(nuovoRuoloDto))
    body: nuovoRuoloDto,
  ) {
    const updated = await this.ruoliService.updateRuolo(id, body);
    return {
      message: 'success',
      data: updated,
    };
  }

  @Delete(':id')
  async deleteRuolo(@Param('id') id: number) {
    await this.ruoliService.deleteRuolo(id);
    return {
      message: 'success',
    };
  }
}
