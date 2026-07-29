const service = require('./courseApplication.service')
const { fail, success } = require('../../shared/response/apiResponse')

async function createApplication(req, res, next) {
  try {
    const application = await service.createApplication(req.body)
    return success(res, { application }, 201)
  } catch (err) {
    return next(err)
  }
}

async function listApplications(req, res, next) {
  try {
    const applications = await service.listApplications()
    return success(res, { applications })
  } catch (err) {
    return next(err)
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const application = await service.updateApplicationStatus(req.params.id, req.body.status)
    if (!application) return fail(res, 'Application not found', 404)
    return success(res, { application })
  } catch (err) {
    return next(err)
  }
}

async function deleteApplication(req, res, next) {
  try {
    const deleted = await service.deleteApplication(req.params.id)
    if (!deleted) return fail(res, 'Application not found', 404)
    return success(res, { message: 'Application deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplicationStatus
}
