const mongoose = require('mongoose')

const followUpArchivedSchema = new mongoose.Schema({
    lead_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Lead'},
    status_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Status'},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    comment: String,
    date: Date
})

const follow_up_archived = mongoose.model('Follow_Up_Archived', followUpArchivedSchema)

module.exports = follow_up_archived