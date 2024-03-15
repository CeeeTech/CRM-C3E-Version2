const mongoose = require('mongoose')

const emailTemplate = new mongoose.Schema({
    title: String,
    subject: String,
    body: String,
})

const EmailTemplate = mongoose.model('emailTemplate', emailTemplate)

module.exports = EmailTemplate