const companydetails = require("../models/companyDetails")
const placementdetails = require('../models/placementDetails')
const jwt = require("jsonwebtoken")
var randomstring = require("randomstring")
const Notifications = require("../models/notifications")
const mail = require("./sendmail")

const manageData = require("./manageData")
const verifyToken = require("./verifyToken")

exports.createcompanydetails = (verifyToken, async (req, res, next) => {
  async function sampost() {
    const ran = () => {
      return randomstring.generate(req.body.companyname.length)
    }
    let sran = ran()
    let docs2 = await manageData.getCompanyDetails("findOne", { code: sran })
    req.body.code = sran
    // console.log(docs2,"lllllllllllllll")
    if (docs2 == null) {
      console.log(req.body.code, "srann", sran)
      let data = await manageData.postCompanyDetails("create", req.body);
      res.send(data)
    }
    else if (docs2 != null) {
      sampost()
    }
  }
  sampost()
})

exports.updatecompanydetails = (verifyToken, async (req, res, next) => {
  let data = await manageData.updateCompanyDetails("updateOne", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, req.body);
  (data && data.message == "error") ? res.send({ message: "exists" }) : (res.send({ message: "success" }));
})

exports.findcompany = (verifyToken, async (req, res, next) => {
  let data = await manageData.getCompanyDetails("findOne", req.body);
  (data && data.message == "error") ? res.send(err) : res.send({ companydetails: data });
})


exports.findcompanytoregister = (verifyToken, async (req, res, next) => {
  let d = await manageData.getPlacementDetails("findOne", { organisation_id: req.body.organisation_id, code: req.body.placementcyclename });
  let data = await manageData.getCompanyDetails("findOne", { organisation_id: req.body.organisation_id, code: req.body.companycode, placementcyclename: d.placementcyclename });
  (data && data.message == "error") ? res.send(err) : res.send({ companydetails: data });
})

exports.findplacementcompany = (verifyToken, async (req, res, next) => {
  let docs = await manageData.getCompanyDetails("findOne", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename });
  if (!docs) {
    res.send({ message: "company details does not exists" });
  } else {
    let payload = { subject: docs._batchname }
    let token = jwt.sign(payload, "JWTSECRET");
    res.status(200).send({ token });
  }
})

exports.findcalcompany = (verifyToken, async (req, res) => {
  let docs = await manageData.getCompanyDetails("find", { organisation_id: req.body.organisation_id }); if (docs.message != "error") {
    var eventData = []
    if (docs.length != 0) {
      docs.forEach((c) => {
        if (c.deadline != "not updated") {
          let a = {}
          a.Subject = c.companyname + " application deadline "
          a.StartTime = new Date(c.deadline)
          a.EndTime = new Date(c.deadline)
          eventData.push(a)
        }
        if (c.dateofvisit != "not updated") {
          let a = {}
          a.Subject = c.companyname + " date of visit "
          a.StartTime = new Date(c.dateofvisit)
          a.EndTime = new Date(c.dateofvisit)
          eventData.push(a)
        }
      })
    }
    res.send(eventData)
  } else
    console.log(
      "Error while retrieving all records : " +
      JSON.stringify(err, undefined, 2)
    )
})

exports.findallcompanies = (verifyToken, async (req, res) => {
  let docs = await manageData.getCompanyDetails("find", { organisation_id: req.body.organisation_id });
  res.send(docs)
})

exports.findacompany = (verifyToken, async (req, res) => {
  docs = await manageData.getCompanyDetails("find", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename })
  docs.message != "error" ? res.send(docs)
    : console.log(
      "Error while retrieving all records : " +
      JSON.stringify(err, undefined, 2)
    )
})

exports.updatestatus = (verifyToken, async (req, res) => {
  await manageData.updateCompanyDetails("updateOne", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname }, req.body);
  res.send({ data: req.body })
})
