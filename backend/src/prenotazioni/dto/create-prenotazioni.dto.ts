import { StatoPrenotazione } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const OrdineItemIngredientiSchema = z.object({
  ingredienteId: z.number().positive(),
});

const OrdineItemSchema = z.object({
  menuItemId: z.number().positive(),
  quantita: z.number().positive().default(1),
  note: z.string().optional(),
  aggiunte: z.array(OrdineItemIngredientiSchema).optional().default([]),
  rimozioni: z.array(OrdineItemIngredientiSchema).optional().default([]),
});

const PagamentoSchema = z.object({
  metodo: z.enum(['CONTANTI', 'CARTA', 'ONLINE']),
});

export const prenotazioneSchema = z.object({
  nominativo: z.string().min(1),
  telefono: z.string().min(1),
  modalita: z.enum(['ASPORTO', 'DOMICILIO']),
  stato: z.enum(StatoPrenotazione),
  note: z.string().optional(),
  giornoPrenotazione: z.coerce.date(),
  fasciaOrariaId: z.number().positive(),

  via: z.string().optional(),
  civico: z.string().optional(),
  citta: z.string().optional(),
  noteIndirizzo: z.string().optional(),

  pagamento: PagamentoSchema,
  items: z.array(OrdineItemSchema).min(1),
});

export const UpdatePrenotazioneSchema = prenotazioneSchema.partial();

export class CreatePrenotazioneDto extends createZodDto(prenotazioneSchema) {}
export class UpdatePrenotazioniDto extends createZodDto(
  UpdatePrenotazioneSchema,
) {}
