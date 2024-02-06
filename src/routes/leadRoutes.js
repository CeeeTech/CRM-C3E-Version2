const express = require('express')
const leadController = require('../controllers/leadController')
const fbLeadController = require('../controllers/fbLeadController')

const router = express.Router()

router.get('/leads', leadController.getLeads)
router.post('/leads', leadController.addLead)
router.post('/leadswithstudent', leadController.addLeadWithExistingStudent)
router.get('/leads/:id', leadController.getOneLeadSummaryDetails)
router.patch('/leads/:id', leadController.updateLead)
router.post('/lead-restore/', leadController.restoreLead)
router.get('/leads-details', leadController.getLeadsSummaryDetails)
router.get('/checkLead', leadController.checkForDuplicate)
router.get('/fbleads', fbLeadController.getLeads)
router.post('/fbleads', fbLeadController.postLeads)
router.get('/fbleads-health', fbLeadController.getFBLeadsHealth)
router.get('/test-leads', leadController.assignLeadsToCounselorsTest)

module.exports = router