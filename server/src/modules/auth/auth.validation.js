const { z } = require('zod')
const { ROLES } = require('./auth.constants')

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character')

module.exports = {
  login: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
    role: z.enum([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT]).optional()
  }),
  register: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    password: passwordSchema,
    role: z.literal(ROLES.STUDENT).optional()
  }),
  refreshToken: z.object({
    refreshToken: z.string().min(20)
  }),
  logout: z.object({
    refreshToken: z.string().min(20).optional()
  }),
  forgotPassword: z.object({
    email: z.string().trim().email()
  }),
  resetPassword: z.object({
    token: z.string().min(20),
    password: passwordSchema
  }),
  passwordSchema
}
