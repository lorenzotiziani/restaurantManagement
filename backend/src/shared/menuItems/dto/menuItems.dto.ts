import { CategoriaMenu } from '@prisma/client';
import z from 'zod';

export const nuovoMenuItemsSchema = z.object({
  nome: z.string().nonoptional(),
  descrizione: z.string().nonoptional(),
  categoria: z.enum([...Object.values(CategoriaMenu)]).nonoptional(),
  prezzo: z.number().nonoptional(),
  disponibile: z.boolean().nonoptional(),
});

export type nuovoMenuItemsDto = z.infer<typeof nuovoMenuItemsSchema>;
