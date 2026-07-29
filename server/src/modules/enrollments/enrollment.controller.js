const enrollmentService = require('./enrollment.service')
const { fail, success } = require('../../shared/response/apiResponse')

async function createEnrollment(req, res, next) {
  try {
    const enrollment = await enrollmentService.createEnrollment(req.user, req.body)
    return success(res, { enrollment }, 201)
  } catch (err) {
    return next(err)
  }
}

async function listEnrollments(req, res, next) {
  try {
    const enrollments = await enrollmentService.listEnrollments(req.user)
    return success(res, { enrollments })
  } catch (err) {
    return next(err)
  }
}

async function deleteEnrollment(req, res, next) {
  try {
    const deleted = await enrollmentService.deleteEnrollment(req.params.id)
    if (!deleted) return fail(res, 'Enrollment not found', 404)
    return success(res, { message: 'Enrollment deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createEnrollment,
  deleteEnrollment,
  listEnrollments
}
