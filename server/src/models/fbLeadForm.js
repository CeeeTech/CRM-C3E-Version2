const mongoose = require('mongoose')

const fbLeadFormSchema = new mongoose.Schema({
    lead_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Lead'},
    form_id: String,
    fb_lead_id: String,
    created_at: Date
})

const fbLeadForm = mongoose.model('fbLeadForm', fbLeadFormSchema)

module.exports = fbLeadForm