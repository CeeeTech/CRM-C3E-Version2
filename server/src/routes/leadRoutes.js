const express = require('express')
const multer = require('multer');
const leadController = require('../controllers/leadController')
const fbLeadController = require('../controllers/fbLeadController')

const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/leads', leadController.getLeads)
router.post('/leads', leadController.addLead)
router.post('/leadswithstudent', leadController.addLeadWithExistingStudent)
router.get('/leads/:id', leadController.getOneLeadSummaryDetails)
router.post('/leads/bulk-import', upload.single('file'),leadController.bulkImport)
router.patch('/leads/:id', leadController.updateLead)
router.post('/lead-restore/', leadController.restoreLead)
router.get('/leads-details', leadController.getLeadsSummaryDetails)
router.get('/checkLead', leadController.checkForDuplicate)
router.get('/fbleads', fbLeadController.getLeads)
router.post('/fbleads', fbLeadController.postLeads)
router.get('/fbleads-health', fbLeadController.getFBLeadsHealth)
router.get('/test-leads', leadController.assignLeadsToCounselorsTest)
router.post('/leads-archive', leadController.archiveLeads)

module.exports = router