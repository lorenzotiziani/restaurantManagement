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
  Req,
  ParseIntPipe,
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
  changeStatoSchema,
} from './dto/prenotazioni.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtPayload } from 'src/auth/entities/auth.entity';

@UseGuards(AuthGuard('jwt'), RolesGuard)
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
    @Query(new ZodValidationPipe(findAvailableSchema))
    query: z.infer<typeof findAvailableSchema>,
  ) {
    const orariAvailable = await this.fasceOrarieService.findAvailable(query);

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

  @Roles('cassa')
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

  // Transizione di stato (macchina a stati); il ruolo abilitato dipende dalla
  // transizione ed è verificato nel service. Nessun @Roles statico qui.
  @Patch(':id/stato')
  async changeStato(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(changeStatoSchema))
    body: z.infer<typeof changeStatoSchema>,
    @Req() req: { user: JwtPayload },
  ) {
    const updated = await this.prenotazioniService.changeStato(
      id,
      body.stato,
      req.user.ruolo,
    );

    return {
      success: true,
      data: updated,
    };
  }

  // a meno che non sia il prossimo giro quindi mancano - di 15 minuti
  @Roles('cassa')
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

  @Roles('cassa')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    const deleted = await this.prenotazioniService.remove(id);

    return {
      success: true,
      data: deleted,
    };
  }
}
