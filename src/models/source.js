const mongoose = require("mongoose");

const sourcesSchema = new mongoose.Schema({
    name: String
})

const source = mongoose.model('Source', sourcesSchema)

module.exports = source