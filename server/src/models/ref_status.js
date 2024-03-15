const mongoose = require("mongoose");

const refStatusSchema = new mongoose.Schema({
    name: String
})

const refstatuses = mongoose.model('refstatuses', refStatusSchema)

module.exports = refstatuses
