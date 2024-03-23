const mongoose = require('mongoose')

const messageTemplate = new mongoose.Schema({
    title: String,
    subject: String,
    body: String,
})

const MessageTemplate = mongoose.model('messageTemplate', messageTemplate)

module.exports = MessageTemplate