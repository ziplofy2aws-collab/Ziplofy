const router = require('express').Router();
const { requireFeature } = require('../middleware/featureGate');
const { protect, workspaceAccess } = require('../middleware/auth');
const c = require('../controllers/edtechController');

router.use(protect, workspaceAccess);
router.use(requireFeature('edtech'));

router.get('/me', c.getMe);
router.get('/dashboard', c.dashboard);
router.get('/settings', c.getSettings);
router.put('/settings', c.updateSettings);

router.get('/teachers', c.listTeachers);
router.post('/teachers', c.createTeacher);
router.put('/teachers/:id', c.updateTeacher);

router.get('/courses', c.listCourses);
router.post('/courses', c.createCourse);
router.put('/courses/:id', c.updateCourse);

router.get('/batches', c.listBatches);
router.post('/batches', c.createBatch);
router.put('/batches/:id', c.updateBatch);
router.post('/batches/:id/enroll', c.enrollStudent);

router.get('/students', c.listStudents);
router.post('/students', c.upsertStudent);
router.get('/students/:contactId', c.getStudent);
router.put('/students/:contactId', c.upsertStudent);
router.delete('/students/:contactId', c.archiveStudent);

router.put('/enrollments/:id', c.updateEnrollment);

router.get('/attendance', c.getAttendance);
router.put('/attendance', c.saveAttendance);

module.exports = router;
