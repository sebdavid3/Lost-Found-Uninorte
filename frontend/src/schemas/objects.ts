import { z } from 'zod'

export const ObjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
})

export type ObjectForm = z.infer<typeof ObjectSchema>
