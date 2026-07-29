const { z } = require('zod')
const { passwordSchema } = require('../auth/auth.validation')

module.exports = {
  create: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: passwordSchema
  })
}
