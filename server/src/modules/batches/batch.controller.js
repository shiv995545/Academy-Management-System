const batchService = require('./batch.service')
const { fail, success } = require('../../shared/response/apiResponse')

async function createBatch(req, res, next) {
  try {
    const batch = await batchService.createBatch(req.body)
    return success(res, { batch }, 201)
  } catch (err) {
    return next(err)
  }
}

async function listBatches(req, res, next) {
  try {
    const batches = await batchService.listBatches(req.user)
    return success(res, { batches })
  } catch (err) {
    return next(err)
  }
}

async function listPublicBatches(req, res, next) {
  try {
    const batches = await batchService.listPublicBatches()
    return success(res, { batches })
  } catch (err) {
    return next(err)
  }
}

async function updateBatch(req, res, next) {
  try {
    const batch = await batchService.updateBatch(req.params.id, req.body)
    if (!batch) return fail(res, 'Batch not found', 404)
    return success(res, { batch })
  } catch (err) {
    return next(err)
  }
}

async function deleteBatch(req, res, next) {
  try {
    const deleted = await batchService.deleteBatch(req.params.id)
    if (!deleted) return fail(res, 'Batch not found', 404)
    return success(res, { message: 'Batch deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createBatch,
  deleteBatch,
  listBatches,
  listPublicBatches,
  updateBatch
}
