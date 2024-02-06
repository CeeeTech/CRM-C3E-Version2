const Course = require('../models/course')
const mongoose = require('mongoose')
 
async function getCourses(req, res) {
    try {
        const courses = await Course.find()
        res.status(200).json(courses)
    } catch (error) {
        console.log("Error fetching courses:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

async function getCourse(req, res) {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: "No such course" })
    }
    const course = await Course.findById({ _id: id })
    if (!course) {
        res.status(400).json({ error: "No such course" })
    }
    res.status(200).json(course)
}

// add new course - name, description(not required)
async function addCourse(req, res) {
    const { name, description, code } = req.body
    if (!name) {
        res.status(400).json({ error: "Name is required" })
    }
    const course = new Course({ name, description, course_code: code })
    try {
        const newCourse = await course.save()
        res.status(201).json(newCourse)
    } catch (error) {
        console.log("Error saving course:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

// update course - name, description(not required)
async function updateCourse(req, res) {
    const { id } = req.params
    const { name, description,code } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: "No such course" })
    }
    const course = await Course.findByIdAndUpdate(id, { name, description, course_code:code }, { new: true })
    if (!course) {
        res.status(400).json({ error: "No such course" })
    }
    res.status(200).json(course)
}

// disable or enable course - status = false or true
async function disableEnableCourse(req, res) {
    const { id } = req.params
    const { status } = req.body
    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: "No such course" })
    }
    const course = await Course.findByIdAndUpdate(id, { status }, { new: true })
    if (!course) {
        res.status(400).json({ error: "No such course" })
    }
    res.status(200).json(course)
}

module.exports = {
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    disableEnableCourse
}