const express = require('express')
const branchController = require('../controllers/branchController')

const router = express.Router()

router.get('/branches', branchController.getBranches)
router.post('/branches', branchController.addBranch)
router.get('/branches/:id', branchController.getBranch)


module.exports = router