import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const findAvailableSchema = z.object({
  numeroPizze: z.coerce.number().optional(),
  giorno: z.coerce.date().optional(),
  orarioDa: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
});

export class FindAvailableDto extends createZodDto(findAvailableSchema) {}
