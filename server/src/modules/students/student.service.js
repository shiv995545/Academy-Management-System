const studentRepository = require('./student.repository')

module.exports = {
  createStudent: studentRepository.create,
  deleteStudent: studentRepository.remove,
  getStudent: studentRepository.findById,
  listStudents: studentRepository.findAll,
  updateStudent: studentRepository.update
}
