const { z } = require('zod')

module.exports = {
  create: z.object({
    courseId: z.coerce.number().int().positive().optional().nullable(),
    courseTitle: z.string().trim().max(160).optional().nullable(),
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z.string().trim().email('Valid email is required').max(160),
    phone: z.string().trim().min(7, 'Phone number is required').max(30),
    message: z.string().trim().max(1200).optional().nullable()
  }),
  updateStatus: z.object({
    status: z.enum(['new', 'contacted', 'enrolled', 'closed'])
  })
}
