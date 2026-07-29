const AppError = require('../../shared/errors/AppError')
const storage = require('../../services/storage/localStorage.service')
const repository = require('./resource.repository')
const { RESOURCE_ACTIONS } = require('./resource.constants')
const {
  canCreateResource,
  canManageAnyResource,
  canManageResource,
  canReadManagementView
} = require('./resource.permissions')

function forbidden(message = 'You do not have permission for this resource') {
  throw new AppError(message, 403)
}

async function createResource(payload, actor) {
  if (!canCreateResource(actor)) forbidden('Only teachers and admins can create resources')
  const resource = await repository.create(payload, actor)
  await repository.logActivity({
    actor,
    resourceId: resource.id,
    action: RESOURCE_ACTIONS.CREATED,
    metadata: { title: resource.title, status: resource.status }
  })
  return resource
}

async function uploadResourceFile(payload, actor) {
  if (!canCreateResource(actor)) forbidden('Only teachers and admins can upload files')
  const file = await storage.saveBase64File(payload)
  await repository.logActivity({
    actor,
    action: RESOURCE_ACTIONS.UPLOADED,
    metadata: { fileName: payload.fileName, mimeType: payload.mimeType, storageKey: file.storageKey }
  })
  return file
}

async function updateResource(id, payload, actor) {
  const existing = await repository.findById(id)
  if (!existing) throw new AppError('Resource not found', 404)
  if (!canManageResource(actor, existing)) forbidden()

  const resource = await repository.update(id, payload)
  await repository.logActivity({
    actor,
    resourceId: resource.id,
    action: RESOURCE_ACTIONS.UPDATED,
    metadata: { title: resource.title }
  })
  return resource
}

async function deleteResource(id, actor) {
  const existing = await repository.findById(id)
  if (!existing) throw new AppError('Resource not found', 404)
  if (!canManageResource(actor, existing)) forbidden()

  await repository.logActivity({
    actor,
    resourceId: id,
    action: RESOURCE_ACTIONS.DELETED,
    metadata: { title: existing.title }
  })
  const deleted = await repository.remove(id)
  return deleted
}

async function updateStatus(id, status, actor) {
  if (!canManageAnyResource(actor)) forbidden('Only admins can moderate resources')
  const resource = await repository.updateStatus(id, status)
  if (!resource) throw new AppError('Resource not found', 404)
  await repository.logActivity({
    actor,
    resourceId: resource.id,
    action: status === 'active' ? RESOURCE_ACTIONS.APPROVED : RESOURCE_ACTIONS.REJECTED,
    metadata: { status }
  })
  return resource
}

async function listManagedResources(filters, actor) {
  if (!canReadManagementView(actor)) forbidden()
  return repository.findAll({
    ...filters,
    uploadedBy: canManageAnyResource(actor) ? filters.uploadedBy : actor.id
  })
}

async function listPublicResources(filters) {
  return repository.findAll({ ...filters, publicOnly: true })
}

async function getPublicResource(id) {
  const resource = await repository.findById(id)
  if (!resource || resource.visibility !== 'public' || resource.status !== 'active') {
    throw new AppError('Resource not found', 404)
  }
  await repository.incrementCounter(id, 'views')
  return resource
}

async function countPublicDownload(id) {
  const resource = await repository.findById(id)
  if (!resource || resource.visibility !== 'public' || resource.status !== 'active') {
    throw new AppError('Resource not found', 404)
  }
  return repository.incrementCounter(id, 'downloads')
}

async function createCategory(payload, actor) {
  if (!canManageAnyResource(actor)) forbidden('Only admins can manage categories')
  const category = await repository.createCategory(payload, actor.id)
  await repository.logActivity({
    actor,
    action: RESOURCE_ACTIONS.CATEGORY_CREATED,
    metadata: { category: category.name }
  })
  return category
}

async function updateCategory(id, payload, actor) {
  if (!canManageAnyResource(actor)) forbidden('Only admins can manage categories')
  const category = await repository.updateCategory(id, payload)
  if (!category) throw new AppError('Category not found', 404)
  await repository.logActivity({
    actor,
    action: RESOURCE_ACTIONS.CATEGORY_UPDATED,
    metadata: { category: category.name }
  })
  return category
}

async function deleteCategory(id, actor) {
  if (!canManageAnyResource(actor)) forbidden('Only admins can manage categories')
  const deleted = await repository.deleteCategory(id)
  if (!deleted) throw new AppError('Category not found', 404)
  await repository.logActivity({
    actor,
    action: RESOURCE_ACTIONS.CATEGORY_DELETED,
    metadata: { categoryId: id }
  })
  return deleted
}

function listActivity(filters, actor) {
  if (!canReadManagementView(actor)) forbidden()
  return repository.listActivity(canManageAnyResource(actor) ? filters : { actorId: actor.id })
}

function getStats(actor) {
  if (!canReadManagementView(actor)) forbidden()
  return repository.stats(canManageAnyResource(actor) ? {} : { uploadedBy: actor.id })
}

module.exports = {
  createCategory,
  createResource,
  countPublicDownload,
  deleteCategory,
  deleteResource,
  getPublicResource,
  getStats,
  listActivity,
  listCategories: repository.listCategories,
  listManagedResources,
  listPublicResources,
  listTags: repository.listTags,
  updateCategory,
  updateResource,
  updateStatus,
  uploadResourceFile
}
