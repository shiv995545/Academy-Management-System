const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const uploadRoot = path.resolve(process.cwd(), 'server', 'uploads', 'resources')
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'text/plain'
])

function extensionFor(fileName, mimeType) {
  const ext = path.extname(fileName).toLowerCase()
  if (ext) return ext

  const fallback = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'text/plain': '.txt'
  }

  return fallback[mimeType] || '.bin'
}

async function saveBase64File({ fileName, mimeType, contentBase64 }) {
  if (!allowedMimeTypes.has(mimeType)) {
    const err = new Error('Unsupported file type')
    err.statusCode = 400
    err.isOperational = true
    throw err
  }

  await fs.promises.mkdir(uploadRoot, { recursive: true })

  const cleanBase64 = contentBase64.includes(',') ? contentBase64.split(',').pop() : contentBase64
  const buffer = Buffer.from(cleanBase64, 'base64')
  const ext = extensionFor(fileName, mimeType)
  const storageKey = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`
  const targetPath = path.join(uploadRoot, storageKey)

  await fs.promises.writeFile(targetPath, buffer)

  return {
    fileUrl: `/uploads/resources/${storageKey}`,
    fileSize: buffer.length,
    mimeType,
    originalFileName: fileName,
    storageKey
  }
}

module.exports = {
  saveBase64File
}
