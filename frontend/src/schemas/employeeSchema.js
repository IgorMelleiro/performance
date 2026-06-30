import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  position: z.string().min(1, 'Cargo é obrigatório.'),
  department: z.string().min(1, 'Área é obrigatória.'),
  active: z.boolean(),
});

export const employeeFiltersSchema = z.object({
  search: z.string(),
  department: z.string(),
  active: z.enum(['all', 'true', 'false']),
});
