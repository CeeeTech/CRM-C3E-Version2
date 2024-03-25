const Report = require("../models/report");
const mongoose = require("mongoose");

async function getAllReports(req, res){
    try {
        const reports = await Report.find();
        res.status(200).json(reports);
      } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
      }
      
};

module.exports = {
    getAllReports,
};