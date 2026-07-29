const teacherService = require('./teacher.service')
const { success } = require('../../shared/response/apiResponse')

async function createTeacher(req, res, next) {
  try {
    const teacher = await teacherService.createTeacher(req.body)
    return success(res, { teacher }, 201)
  } catch (err) {
    return next(err)
  }
}

async function listTeachers(req, res, next) {
  try {
    const teachers = await teacherService.listTeachers()
    return success(res, { teachers })
  } catch (err) {
    return next(err)
  }
}

async function updateTeacher(req, res, next) {
  try {
    const teacher = await teacherService.updateTeacher(req.params.id, req.body)
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' })
    return success(res, { teacher })
  } catch (err) {
    return next(err)
  }
}

async function deleteTeacher(req, res, next) {
  try {
    const deleted = await teacherService.deleteTeacher(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: 'Teacher not found' })
    return success(res, { message: 'Teacher deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createTeacher,
  deleteTeacher,
  listTeachers,
  updateTeacher
}
