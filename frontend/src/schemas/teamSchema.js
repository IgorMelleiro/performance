import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(1, 'Nome do time é obrigatório.'),
  description: z.string().optional(),
});
