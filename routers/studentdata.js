const express = require("express")
var router = express.Router()

const Studentdata = require("../controllers/studentData")
router.post("/findcollegestudents", Studentdata.findcollegestudents)
router.post("/findstudentdetails", Studentdata.findstudentdetails)
router.post("/updatestudentdatac", Studentdata.updatestudentdatac)
router.post("/storefiles", Studentdata.storefile)
router.post("/updateverified", Studentdata.updateverified)
router.post("/askfreeze", Studentdata.askfreeze)
router.post("/createStudentdata", Studentdata.createStudentdata)
router.post("/askunfreeze", Studentdata.askunfreeze)
router.post("/updatedemoteyear", Studentdata.updatedemoteyear)
router.post("/updatedemoteyearstudent", Studentdata.updatedemoteyearstudent)
router.post("/updatebacklogs", Studentdata.updatebacklogs)
router.post("/updatemarks", Studentdata.updatemarks)
router.post("/addstudentstoplacementcycle", Studentdata.addstudentstoplacementcycle)
router.post("/studentsplacementaddedstatus", Studentdata.studentsplacementaddedstatus)
router.post("/pendinginvitations", Studentdata.pendinginvitations)
router.post("/mailtoregisterstudents", Studentdata.mailtoregisterstudents)
router.post("/updatestudentyear", Studentdata.updateyear)
router.post("/studentplacementinterest", Studentdata.studentplacementinterest)
router.post("/studentupdateinterest", Studentdata.studentupdateinterest)
router.post("/dashboardcampusreports", Studentdata.dashboardcampusreports)

module.exports = router
