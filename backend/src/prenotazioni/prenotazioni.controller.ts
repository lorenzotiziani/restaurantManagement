import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { PrenotazioniService } from './prenotazioni.service';
import { CreatePrenotazioneDto } from './dto/create-prenotazioni.dto';
import type { UpdatePrenotazioniDto } from './dto/update-prenotazioni.dto';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { findAvailableSchema } from '../shared/fasceOrarie/dto/fasceOrarie.dto';
import { FasceOrarieService } from 'src/shared/fasceOrarie/fasceOrarie.service';
import { PagamentoService } from 'src/shared/pagamento/pagamento.service';
import z from 'zod';
import {
  byUserSchema,
  assignFattorinoSchema,
  updatePagamentoSchema,
} from './dto/prenotazioni.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('prenotazioni')
export class PrenotazioniController {
  constructor(
    private readonly prenotazioniService: PrenotazioniService,
    private readonly fasceOrarieService: FasceOrarieService,
    private readonly pagamentoService: PagamentoService,
  ) {}

  @Get()
  async findAll() {
    const all = await this.prenotazioniService.findAll();

    if (!all) throw new NotFoundException();

    return {
      success: true,
      data: all,
    };
  }

  //tutte le prenotazioni dell'utente come "storico"
  @Get('getHistory')
  async findByUserID(
    @Query(new ZodValidationPipe(byUserSchema))
    query: z.infer<typeof byUserSchema>,
  ) {
    const byUserIdentity = await this.prenotazioniService.findMany(
      query.nominativo,
      query.telefono,
    );

    return {
      success: true,
      data: byUserIdentity,
    };
  }

  //l'ultima prenotazione per quell'utente
  @Get('lastReservation')
  async findLastByUserId(
    @Query(new ZodValidationPipe(byUserSchema))
    query: z.infer<typeof byUserSchema>,
  ) {
    const last = await this.prenotazioniService.findLast(
      query.nominativo,
      query.telefono,
    );

    return {
      success: true,
      data: last,
    };
  }

  @Get('fasce-orarie/available')
  async findAvailable(
    @Body(new ZodValidationPipe(findAvailableSchema))
    body: z.infer<typeof findAvailableSchema>,
  ) {
    const orariAvailable = await this.fasceOrarieService.findAvailable(body);

    return {
      success: true,
      data: orariAvailable,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const byPrenotazioneId = await this.prenotazioniService.findOne(id);

    return {
      success: true,
      data: byPrenotazioneId,
    };
  }

  @Post('assegnaFattorino')
  async assignFattorino(
    @Body(new ZodValidationPipe(assignFattorinoSchema))
    body: z.infer<typeof assignFattorinoSchema>,
  ) {
    const { prenotazioneId, fattorinoId } = body;

    const assigned = await this.prenotazioniService.assignFattorino(
      prenotazioneId,
      fattorinoId,
    );

    return {
      success: true,
      data: assigned,
    };
  }

  @Post()
  async create(@Body() createPrenotazioniDto: CreatePrenotazioneDto) {
    const newPrenotazione = await this.prenotazioniService.create(
      createPrenotazioniDto,
    );

    return {
      success: true,
      data: newPrenotazione,
    };
  }

  @Patch('pagamento/update')
  async updatePagamento(
    @Body(new ZodValidationPipe(updatePagamentoSchema))
    body: z.infer<typeof updatePagamentoSchema>,
  ) {
    const { prenotazioneId } = body;

    const updated = await this.pagamentoService.updatePagamento(prenotazioneId);

    return {
      success: true,
      data: updated,
    };
  }

  // a meno che non sia il prossimo giro quindi mancano - di 15 minuti
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updatePrenotazioniDto: UpdatePrenotazioniDto,
  ) {
    const updated = await this.prenotazioniService.update(
      +id,
      updatePrenotazioniDto,
    );

    return {
      success: true,
      data: updated,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const deleted = await this.prenotazioniService.remove(id);

    return {
      success: true,
      data: deleted,
    };
  }
}
