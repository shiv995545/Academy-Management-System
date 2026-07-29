const { z } = require('zod')

const baseCourseSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  description: z.string().trim().max(1200).optional().nullable(),
  category: z.string().trim().max(80).optional().nullable(),
  subject: z.string().trim().max(120).optional().nullable(),
  classLevel: z.coerce.number().int().min(1).max(99).optional().nullable(),
  fee: z.coerce.number().min(0).max(99999999).optional(),
  duration: z.string().trim().max(80).optional().nullable(),
  details: z.string().trim().max(5000).optional().nullable(),
  imageUrl: z.string().trim().max(1000).optional().nullable(),
  classCount: z.coerce.number().int().min(0).max(999).optional().nullable(),
  startDate: z.string().trim().max(20).optional().nullable(),
  teacherName: z.string().trim().max(120).optional().nullable(),
  batchTiming: z.string().trim().max(160).optional().nullable(),
  availableSeats: z.coerce.number().int().min(0).max(9999).optional().nullable(),
  tags: z.string().trim().max(1000).optional().nullable(),
  syllabus: z.string().trim().max(5000).optional().nullable(),
  isUpcoming: z.boolean().optional(),
  isFeatured: z.boolean().optional()
})

module.exports = {
  create: baseCourseSchema,
  update: baseCourseSchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  })
}
