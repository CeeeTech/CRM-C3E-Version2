const mongoose = require('mongoose')

const followUpSchema = new mongoose.Schema({
    lead_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Lead'},
    status_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Status'},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    comment: String,
    date: Date
})

const follow_up = mongoose.model('Follow_Up', followUpSchema)

module.exports = follow_up