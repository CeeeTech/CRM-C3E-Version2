const express = require('express')
const counsellorAssignmentController = require('../controllers/counsellorAssignmentController')

const router = express.Router()

router.post('/counsellorAssignment', counsellorAssignmentController.assignLeadToCounsellor)
router.get('/getBumps', counsellorAssignmentController.getBumpedLeads)

module.exports = router