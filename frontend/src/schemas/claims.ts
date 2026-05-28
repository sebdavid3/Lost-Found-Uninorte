import { z } from 'zod'

export const EvidenceSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  description: z.string().min(1),
  url: z.string().url().optional(),
})

export const CreateClaimSchema = z.object({
  objectId: z.string(),
  evidences: z.array(EvidenceSchema).min(1),
  notes: z.string().optional(),
})

export type CreateClaim = z.infer<typeof CreateClaimSchema>
