const studentService = require('./student.service')
const { fail, success } = require('../../shared/response/apiResponse')

async function createStudent(req, res, next) {
  try {
    const student = await studentService.createStudent(req.body)
    return success(res, { student }, 201)
  } catch (err) {
    return next(err)
  }
}

async function listStudents(req, res, next) {
  try {
    const students = await studentService.listStudents()
    return success(res, { students })
  } catch (err) {
    return next(err)
  }
}

async function getStudent(req, res, next) {
  try {
    const student = await studentService.getStudent(req.params.id)
    if (!student) return fail(res, 'Student not found', 404)
    return success(res, { student })
  } catch (err) {
    return next(err)
  }
}

async function updateStudent(req, res, next) {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body)
    if (!student) return fail(res, 'Student not found', 404)
    return success(res, { student })
  } catch (err) {
    return next(err)
  }
}

async function deleteStudent(req, res, next) {
  try {
    const deleted = await studentService.deleteStudent(req.params.id)
    if (!deleted) return fail(res, 'Student not found', 404)
    return success(res, { message: 'Student deleted successfully' })
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  createStudent,
  deleteStudent,
  getStudent,
  listStudents,
  updateStudent
}
