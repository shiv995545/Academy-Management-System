const { z } = require('zod')
const { RESOURCE_TYPES } = require('./resource.constants')

const resourcePayload = {
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2000).optional().nullable(),
  subject: z.string().trim().max(120).optional().nullable(),
  classLevel: z.number().int().min(1).max(12).optional().nullable(),
  thumbnailUrl: z.string().trim().url().optional().or(z.literal('')).nullable(),
  fileUrl: z.string().trim().optional().nullable(),
  originalFileName: z.string().trim().max(240).optional().nullable(),
  storageKey: z.string().trim().optional().nullable(),
  mimeType: z.string().trim().max(120).optional().nullable(),
  fileSize: z.number().int().nonnegative().optional().nullable(),
  category: z.string().trim().min(2).max(120),
  tags: z.array(z.string().trim().min(1).max(80)).max(12).optional().default([]),
  resourceType: z.enum(RESOURCE_TYPES).default('pdf'),
  visibility: z.enum(['public', 'private']).default('public'),
  status: z.enum(['active', 'pending', 'rejected']).optional()
}

module.exports = {
  create: z.object(resourcePayload),
  update: z.object(resourcePayload).partial(),
  updateStatus: z.object({
    status: z.enum(['active', 'pending', 'rejected'])
  }),
  createCategory: z.object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().max(1000).optional().nullable()
  }),
  updateCategory: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).optional().nullable()
  }),
  upload: z.object({
    fileName: z.string().trim().min(3).max(240),
    mimeType: z.string().trim().min(3).max(120),
    contentBase64: z.string().min(10)
  })
}
