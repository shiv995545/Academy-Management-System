const authService = require('../auth/auth.service')
const teacherRepository = require('./teacher.repository')
const { hashPassword } = require('../../utils/password')

async function createTeacher(data) {
  return authService.createTeacher(data)
}

async function listTeachers() {
  return teacherRepository.findAll()
}

async function updateTeacher(id, data) {
  return teacherRepository.update(id, {
    ...data,
    passwordHash: data.password ? hashPassword(data.password) : null
  })
}

async function deleteTeacher(id) {
  return teacherRepository.remove(id)
}

module.exports = {
  createTeacher,
  deleteTeacher,
  listTeachers,
  updateTeacher
}
