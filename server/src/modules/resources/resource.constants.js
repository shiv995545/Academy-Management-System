const RESOURCE_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REJECTED: 'rejected'
}

const RESOURCE_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

const RESOURCE_TYPES = ['pdf', 'video', 'link', 'doc', 'image', 'quiz', 'note']

const RESOURCE_ACTIONS = {
  CREATED: 'resource.created',
  UPDATED: 'resource.updated',
  DELETED: 'resource.deleted',
  UPLOADED: 'resource.uploaded',
  APPROVED: 'resource.approved',
  REJECTED: 'resource.rejected',
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_DELETED: 'category.deleted'
}

module.exports = {
  RESOURCE_ACTIONS,
  RESOURCE_STATUS,
  RESOURCE_TYPES,
  RESOURCE_VISIBILITY
}
