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
import {
  CreatePrenotazioneDto,
  UpdatePrenotazioniDto,
} from './dto/create-prenotazioni.dto';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { FindAvailableDto } from '../shared/fasceOrarie/dto/fasceOrarie.dto';
import { FasceOrarieService } from 'src/shared/fasceOrarie/fasceOrarie.service';
import { PagamentoService } from 'src/shared/pagamento/pagamento.service';
import {
  byUserDto,
  assignFattorinoDto,
  updatePagamentoDto,
  changeStatoDto,
} from './dto/prenotazioni.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtPayload } from 'src/auth/entities/refreshToken.entity';

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
    @Query(new ZodValidationPipe(byUserDto))
    query: byUserDto,
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
    @Query(new ZodValidationPipe(byUserDto))
    query: byUserDto,
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
    @Query(new ZodValidationPipe(FindAvailableDto))
    query: FindAvailableDto,
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
    @Body(new ZodValidationPipe(assignFattorinoDto))
    body: assignFattorinoDto,
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
  async create(
    @Body(new ZodValidationPipe(CreatePrenotazioneDto))
    body: CreatePrenotazioneDto,
  ) {
    const newPrenotazione = await this.prenotazioniService.create(body);

    return {
      success: true,
      data: newPrenotazione,
    };
  }

  @Patch('pagamento/update')
  async updatePagamento(
    @Body(new ZodValidationPipe(updatePagamentoDto))
    body: updatePagamentoDto,
  ) {
    const { prenotazioneId, pagato, metodo } = body;

    const updated = await this.pagamentoService.updatePagamento(
      prenotazioneId,
      pagato,
      metodo,
    );

    return {
      success: true,
      data: updated,
    };
  }

  /* 
    Transizione di stato (macchina a stati); il ruolo abilitato dipende dalla
    transizione ed è verificato nel service. Nessun @Roles statico qui.
  */
  @Patch(':id/stato')
  async changeStato(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(changeStatoDto))
    body: changeStatoDto,
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
    @Body(new ZodValidationPipe(UpdatePrenotazioniDto))
    body: UpdatePrenotazioniDto,
  ) {
    const updated = await this.prenotazioniService.update(id, body);

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
