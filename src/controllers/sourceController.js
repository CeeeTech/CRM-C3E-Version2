const Source = require('../models/source')
const mongoose = require('mongoose')

async function getAllSource(req, res) {
    try {
        const sources = await Source.find()
        res.status(200).json(sources)
    } catch (error) {
        console.log("Error fetching sources:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }

}


module.exports = {
    getAllSource
}