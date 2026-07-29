const courseRepository = require('./course.repository')

module.exports = {
  createCourse: courseRepository.create,
  deleteCourse: courseRepository.remove,
  listCourses: courseRepository.findAll,
  listPublicCourses: courseRepository.findPublic,
  updateCourse: courseRepository.update
}
