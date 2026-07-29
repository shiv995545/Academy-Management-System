const express = require('express')
const helmet = require('helmet')
const authController = require('./modules/auth/auth.controller')
const authRoutes = require('./modules/auth/auth.routes')
const batchRoutes = require('./modules/batches/batch.routes')
const contactRoutes = require('./modules/contact/contact.routes')
const classLevelRoutes = require('./modules/classLevels/classLevel.routes')
const courseApplicationRoutes = require('./modules/courseApplications/courseApplication.routes')
const courseRoutes = require('./modules/courses/course.routes')
const enrollmentRoutes = require('./modules/enrollments/enrollment.routes')
const resourceRoutes = require('./modules/resources/resource.routes')
const studentRoutes = require('./modules/students/student.routes')
const teacherRoutes = require('./modules/teachers/teacher.routes')
const corsMiddleware = require('./middleware/cors.middleware')
const { errorHandler, notFound } = require('./middleware/error.middleware')

const app = express()
const api = express.Router()

app.use(helmet())
app.use(corsMiddleware)
app.use(express.json({ limit: '25mb' }))
app.use('/uploads', express.static('server/uploads'))

app.get('/', authController.getApiInfo)

api.use('/auth', authRoutes)
api.use('/contact', contactRoutes)
api.use('/class-levels', classLevelRoutes)
api.use('/course-applications', courseApplicationRoutes)
api.use('/admin/teachers', teacherRoutes)
api.use('/students', studentRoutes)
api.use('/courses', courseRoutes)
api.use('/batches', batchRoutes)
api.use('/enrollments', enrollmentRoutes)
api.use('/resources', resourceRoutes)

app.use('/api/v1', api)

app.use(notFound)
app.use(errorHandler)

module.exports = app
