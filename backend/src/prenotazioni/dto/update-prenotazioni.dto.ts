import { z } from 'zod';
import { prenotazioneSchema } from './create-prenotazioni.dto';

export const UpdatePrenotazioneSchema = prenotazioneSchema.partial();

export type UpdatePrenotazioniDto = z.infer<typeof UpdatePrenotazioneSchema>;
