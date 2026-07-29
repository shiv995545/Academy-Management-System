const courseService = require('./course.service')
const { fail, success } = require('../../shared/response/apiResponse')

async function createCourse(req, res, next) {
  try {
    const course = await courseService.createCourse(req.body)
    return success(res, { course }, 201)
  } catch (err) {
    return next(err)
  }
}

async function listCourses(req, res, next) {
  try {
    const courses = await courseService.listCourses()
    return success(res, { courses })
  } catch (err) {
    return next(err)
  }
}

async function listPublicCourses(req, res, next) {
  try {
    const courses = await courseService.listPublicCourses()
    return success(res, { courses })
  } catch (err) {
    return next(err)
  }
}

async function updateCourse(req, res, next) {
  try {
    const course = await courseService.updateCourse(req.params.id, req.body)
    if (!course) return fail(res, 'Course not found', 404)
    return success(res, { course })
  } catch (err) {
    return next(err)
  }
}

async function deleteCourse(req, res, next) {
  try {
    const deleted = await courseService.deleteCourse(req.params.id)
    if (!deleted) return fail(res, 'Course not found', 404)
    return success(res, { message: 'Course deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createCourse,
  deleteCourse,
  listPublicCourses,
  listCourses,
  updateCourse
}
