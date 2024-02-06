const Status = require('../models/status')
const mongoose = require('mongoose')

async function getAllStatus(req, res) {
    try {
        const statuses = await Status.find()
        res.status(200).json(statuses)
    } catch (error) {
        console.log("Error fetching status:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }

}

async function getAllStatusCount(req, res) {
    try {
        const statuses = await Status.find();

        // Filter statuses with name 'RING NO ANSWER' and 'Registered'
        const ringNoAnswerCount = statuses.filter(status => status.name === 'Ring no answer').length;
        const registeredCount = statuses.filter(status => status.name === 'Registered').length;
        const emailCount = statuses.filter(status => status.name === 'send email').length;
        const whatsappCount = statuses.filter(status => status.name === 'whatsapp & sms').length;
        const meetingCount = statuses.filter(status => status.name === 'schedule meetings').length;
        const cousedetailsCount = statuses.filter(status => status.name === 'couse details').length;
        const nextintakeCount = statuses.filter(status => status.name === 'next intake').length;
        const droppedCount = statuses.filter(status => status.name === 'dropped').length;

        // console.log("Ring no answer count:", ringNoAnswerCount);
        // console.log("Registered count:", registeredCount);

        res.status(200).json({ ringNoAnswerCount, registeredCount,emailCount,whatsappCount,meetingCount,cousedetailsCount,nextintakeCount,droppedCount, statuses });
    } catch (error) {
        console.log("Error fetching status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

async function getStatus(req, res) {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: "No such Status" })
    }

    const status = await Status.findById({ _id: id })

    if (!status) {
        res.status(400).json({ error: "No such Status" })
    }

    res.status(200).json(status)

}

module.exports = {
    getAllStatus,
    getStatus,
    getAllStatusCount
}