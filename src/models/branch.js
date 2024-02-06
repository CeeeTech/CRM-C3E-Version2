const mongoose = require('mongoose')

const branchSchema = new mongoose.Schema({
    name: String
})

const branch = mongoose.model('Branch', branchSchema)

module.exports = branch