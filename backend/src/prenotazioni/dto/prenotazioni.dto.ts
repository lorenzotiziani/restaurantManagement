import z from 'zod';
import { MetodoPagamento, StatoPrenotazione } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';

export const changeStatoSchema = z.object({
  stato: z.nativeEnum(StatoPrenotazione),
});

export const byUserSchema = z.object({
  nominativo: z.string().nonoptional(),
  telefono: z.e164().nonoptional(),
});

export const assignFattorinoSchema = z.object({
  prenotazioneId: z.number().nonoptional(),
  fattorinoId: z.number().nonoptional(),
});

export const updatePagamentoSchema = z.object({
  prenotazioneId: z.number().nonoptional(),
  pagato: z.boolean().optional(),
  metodo: z.enum(MetodoPagamento).optional(),
});

export class changeStatoDto extends createZodDto(changeStatoSchema) {}
export class byUserDto extends createZodDto(byUserSchema) {}
export class assignFattorinoDto extends createZodDto(assignFattorinoSchema) {}
export class updatePagamentoDto extends createZodDto(updatePagamentoSchema) {}
