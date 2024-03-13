const express = require('express')
const multer = require('multer');
const referral =require('../controllers/refereeController')

const router = express.Router()
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/viewreferee',referral.getAllReferral)


module.exports = router