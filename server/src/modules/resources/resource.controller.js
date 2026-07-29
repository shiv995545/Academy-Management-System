const resourceService = require('./resource.service')
const { success } = require('../../shared/response/apiResponse')

function queryFilters(req) {
  return {
    search: req.query.search,
    category: req.query.category,
    tag: req.query.tag,
    subject: req.query.subject,
    status: req.query.status,
    uploadedBy: req.query.uploadedBy,
    teacherId: req.query.teacherId,
    limit: req.query.limit,
    offset: req.query.offset
  }
}

async function listPublic(req, res, next) {
  try {
    const resources = await resourceService.listPublicResources(queryFilters(req))
    return success(res, { resources })
  } catch (err) {
    return next(err)
  }
}

async function getPublic(req, res, next) {
  try {
    const resource = await resourceService.getPublicResource(req.params.id)
    return success(res, { resource })
  } catch (err) {
    return next(err)
  }
}

async function countDownload(req, res, next) {
  try {
    const counter = await resourceService.countPublicDownload(req.params.id)
    return success(res, { counter })
  } catch (err) {
    return next(err)
  }
}

async function listManaged(req, res, next) {
  try {
    const resources = await resourceService.listManagedResources(queryFilters(req), req.user)
    return success(res, { resources })
  } catch (err) {
    return next(err)
  }
}

async function create(req, res, next) {
  try {
    const resource = await resourceService.createResource(req.body, req.user)
    return success(res, { resource }, 201)
  } catch (err) {
    return next(err)
  }
}

async function upload(req, res, next) {
  try {
    const file = await resourceService.uploadResourceFile(req.body, req.user)
    return success(res, { file }, 201)
  } catch (err) {
    return next(err)
  }
}

async function update(req, res, next) {
  try {
    const resource = await resourceService.updateResource(req.params.id, req.body, req.user)
    return success(res, { resource })
  } catch (err) {
    return next(err)
  }
}

async function remove(req, res, next) {
  try {
    await resourceService.deleteResource(req.params.id, req.user)
    return success(res, { message: 'Resource deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

async function updateStatus(req, res, next) {
  try {
    const resource = await resourceService.updateStatus(req.params.id, req.body.status, req.user)
    return success(res, { resource })
  } catch (err) {
    return next(err)
  }
}

async function listCategories(req, res, next) {
  try {
    const categories = await resourceService.listCategories()
    return success(res, { categories })
  } catch (err) {
    return next(err)
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await resourceService.createCategory(req.body, req.user)
    return success(res, { category }, 201)
  } catch (err) {
    return next(err)
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await resourceService.updateCategory(req.params.id, req.body, req.user)
    return success(res, { category })
  } catch (err) {
    return next(err)
  }
}

async function deleteCategory(req, res, next) {
  try {
    await resourceService.deleteCategory(req.params.id, req.user)
    return success(res, { message: 'Category deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

async function listTags(req, res, next) {
  try {
    const tags = await resourceService.listTags()
    return success(res, { tags })
  } catch (err) {
    return next(err)
  }
}

async function listActivity(req, res, next) {
  try {
    const activity = await resourceService.listActivity({ actorId: req.query.actorId }, req.user)
    return success(res, { activity })
  } catch (err) {
    return next(err)
  }
}

async function stats(req, res, next) {
  try {
    const statsResult = await resourceService.getStats(req.user)
    return success(res, { stats: statsResult })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  create,
  createCategory,
  countDownload,
  deleteCategory,
  getPublic,
  listActivity,
  listCategories,
  listManaged,
  listPublic,
  listTags,
  remove,
  stats,
  update,
  updateCategory,
  updateStatus,
  upload
}
