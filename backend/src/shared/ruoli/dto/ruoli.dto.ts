import z from 'zod';
import { createZodDto } from 'nestjs-zod';

export const nuovoRuoloSchema = z.object({
  nome: z.string().nonoptional(),
  permessi: z.array(z.string()).nonoptional(),
});

export class nuovoRuoloDto extends createZodDto(nuovoRuoloSchema) {}
