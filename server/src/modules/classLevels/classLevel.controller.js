const service = require('./classLevel.service')
const { fail, success } = require('../../shared/response/apiResponse')

async function createClassLevel(req, res, next) {
  try {
    const classLevel = await service.createClassLevel(req.body)
    return success(res, { classLevel }, 201)
  } catch (err) {
    return next(err)
  }
}

async function listClassLevels(req, res, next) {
  try {
    const classLevels = await service.listClassLevels()
    return success(res, { classLevels })
  } catch (err) {
    return next(err)
  }
}

async function listPublicClassLevels(req, res, next) {
  try {
    const classLevels = await service.listClassLevels({ publicOnly: true })
    return success(res, { classLevels })
  } catch (err) {
    return next(err)
  }
}

async function updateClassLevel(req, res, next) {
  try {
    const classLevel = await service.updateClassLevel(req.params.id, req.body)
    if (!classLevel) return fail(res, 'Class level not found', 404)
    return success(res, { classLevel })
  } catch (err) {
    return next(err)
  }
}

async function deleteClassLevel(req, res, next) {
  try {
    const deleted = await service.deleteClassLevel(req.params.id)
    if (!deleted) return fail(res, 'Class level not found', 404)
    return success(res, { message: 'Class level deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createClassLevel,
  deleteClassLevel,
  listClassLevels,
  listPublicClassLevels,
  updateClassLevel
}
