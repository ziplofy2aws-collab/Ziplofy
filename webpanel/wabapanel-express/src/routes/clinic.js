const router = require('express').Router();
const { requireFeature } = require('../middleware/featureGate');
const { protect, workspaceAccess } = require('../middleware/auth');
const c = require('../controllers/clinicController');

router.use(protect, workspaceAccess);
router.use(requireFeature('clinic'));

router.get('/me', c.getMe);
router.get('/settings', c.getSettings);
router.put('/settings', c.updateSettings);

router.get('/doctors', c.listDoctors);
router.post('/doctors', c.createDoctor);
router.get('/doctors/:id/schedule', c.getSchedule);
router.put('/doctors/:id/schedule', c.updateSchedule);
router.get('/doctors/:id', c.getDoctor);
router.put('/doctors/:id', c.updateDoctor);
router.delete('/doctors/:id', c.deleteDoctor);

router.get('/patients/export', c.exportPatients);
router.get('/patients/duplicates', c.findDuplicates);
router.get('/patients', c.listPatients);
router.post('/patients', c.upsertPatient);
router.get('/patients/:contactId', c.getPatient);
router.put('/patients/:contactId', c.upsertPatient);
router.delete('/patients/:contactId', c.archivePatient);

router.get('/queue', c.listQueue);
router.post('/queue/check-in', c.checkIn);
router.post('/queue/call-next', c.callNext);
router.post('/queue/:id/call', c.callToken);
router.post('/queue/:id/skip', c.skipToken);
router.post('/queue/:id/requeue', c.requeueToken);
router.post('/queue/:id/complete', c.completeToken);
router.post('/queue/:id/no-show', c.noShowToken);
router.post('/queue/:id/cancel', c.cancelToken);

router.get('/visits', c.listVisits);
router.get('/visits/:id', c.getVisit);
router.put('/visits/:id', c.updateVisit);
router.post('/visits/:id/finalize', c.finalizeVisit);
router.post('/visits/:id/prescription', c.savePrescription);
router.post('/visits/:id/prescription/send', c.sendPrescription);

module.exports = router;
