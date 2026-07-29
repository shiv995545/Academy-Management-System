const { z } = require('zod')

const classLevelSchema = z.object({
  value: z.coerce.number().int().min(1).max(99),
  label: z.string().trim().min(1).max(80),
  stage: z.string().trim().max(120).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(999).optional(),
  isActive: z.boolean().optional()
})

module.exports = {
  create: classLevelSchema,
  update: classLevelSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  })
}
