const mongoose = require('mongoose')

const refFollowupAssignment = new mongoose.Schema({
    referral_id: {type: mongoose.Schema.Types.ObjectId, ref: 'referral'},
    // counsellor_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status_id: {type: mongoose.Schema.Types.ObjectId, ref: 'refstatuses'},
    assigned_at: Date
})

const referralFollowupAssignment = mongoose.model('referralFollowupAssignment', refFollowupAssignment)

module.exports = referralFollowupAssignment