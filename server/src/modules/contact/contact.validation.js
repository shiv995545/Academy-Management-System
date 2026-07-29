const { z } = require('zod')

module.exports = {
  createMessage: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Enter a valid email address'),
    phone: z.string().trim().min(7, 'Phone number is required').max(30),
    subject: z.string().trim().min(2, 'Subject is required').max(120),
    message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000)
  })
}
