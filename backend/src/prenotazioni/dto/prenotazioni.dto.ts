import z from 'zod';

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
});
