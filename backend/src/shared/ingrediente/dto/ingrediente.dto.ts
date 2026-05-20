import z from 'zod';

export const nuovoIngredienteSchema = z.object({
  nome: z.string().nonoptional(),
  prezzo: z.number().nonoptional(),
  diponibile: z.boolean().nonoptional(),
});

export type nuovoIngredienteDto = z.infer<typeof nuovoIngredienteSchema>;
