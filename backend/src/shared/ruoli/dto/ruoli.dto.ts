import z from 'zod';

export const nuovoRuoloSchema = z.object({
  nome: z.string().nonoptional(),
  permessi: z.array(z.string()).nonoptional(),
});

export type nuovoRuoloDto = z.infer<typeof nuovoRuoloSchema>;
