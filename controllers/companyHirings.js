const Mail = require("../models/placementStatus")
const comhir = require("../models/companyHirings")
const verifyToken = require("./verifyToken")
const manageData = require("./manageData")
const mail = require("./sendmail")

exports.createhirings = (verifyToken, async (req, res, next) => {
  let collegedata = await manageData.getCollegeData("findOne", { organisation_id: req.body.organisation_id })
  let mails = []
  req.body.accepted.forEach((a) => {
    mails.push(`${a.rollnumber}${collegedata.mailvalidation}`)
  })
  let mailDetails1 = {
    from: "placementscycle@gmail.com",
    to: mails,
    subject: `Registrations for Arikya testtingg `,
    html: `${req.body.lastItem} lastItem - accepted`,
  }
  let mailcontent = mailDetails1.html
  let collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails1.subject }
  mail(mailDetails1, collectmail)
  mails = []
  req.body.rejected.forEach((a) => {
    mails.push(`${a.rollnumber}${collegedata.mailvalidation}`)
  })
  let mailDetails = {
    from: "placementscycle@gmail.com",
    to: mails,
    subject: `Registrations for Arikya testtingg `,
    html: `${req.body.lastItem} lastItem - rejected`,
  }
  mailcontent = mailDetails.html
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
  mail(mailDetails, collectmail)
  req.body.accepted.forEach(async (c, i) => {
    user = new comhir(c)
    req.body.lastItem && (docs1 = await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, { offerstatus: 'yes' }))
    user.save(function (err, results) { })
    if (req.body.accepted.length - 1 == i) {
      if (req.body.rejected.length == 0) {
        res.send({ message: "success" })
      }
      else {
        req.body.rejected.forEach(async (e, index) => {
          await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: e.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, { placed: "no", rejectedat: req.body.accepted[0].hiringflowname, offerstatus: 'no' })
          if (req.body.rejected.length - 1 == index) {
            res.send({ message: "success" })
          }
        })
      }
    }
  })
})

exports.updatehirings = (verifyToken, async (req, res, next) => {
  let collegedata = await manageData.getCollegeData("findOne", { organisation_id: req.body.organisation_id })

  await manageData.postCompanyHirings("deleteMany", { organisation_id: req.body.organisation_id, placementcyclename: req.body.accepted[0].placementcyclename, companyname: req.body.accepted[0].companyname, hiringflowname: req.body.accepted[0].hiringflowname })

  let mails = []
  req.body.accepted.forEach((a) => {
    mails.push(`${a.rollnumber}${collegedata.mailvalidation}`)
  })
  let mailDetails = {
    from: "placementscycle@gmail.com",
    to: mails,
    subject: `Registrations for Arikya testtingg `,
    html: `${req.body.lastItem} lastItem - accepted`,
  }
  mailcontent = mailDetails.html
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
  mail(mailDetails, collectmail)
  mails = []
  req.body.rejected.forEach((a) => {
    mails.push(`${a.rollnumber}${collegedata.mailvalidation}`)
  })
  let mailDetails1 = {
    from: "placementscycle@gmail.com",
    to: mails,
    subject: `Registrations for Arikya testtingg `,
    html: `${req.body.lastItem} lastItem - rejected`,
  }
  mailcontent = mailDetails1.html
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails1.subject }
  mail(mailDetails1, collectmail)

  req.body.accepted.forEach(async (c, i) => {
    user = new comhir(c)
    if (req.body.lastItem) {
      await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, { offerstatus: 'yes', rejectedat: '' })
      if (req.body.accepted.length - 1 == i) {
        res.send({ message: "success" })
      }
    }
    else {
      await manageData.updatePlacementStatus("updateOne", { organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, placementcyclename: c.placementcyclename, companyname: c.companyname }, { placed: "", offerstatus: '', rejectedat: '' })
      if (req.body.accepted.length - 1 == i) {
        res.send({ message: "success" })
      }
    }
    user.save(function (err, results) { })
  })

})

exports.findplacementwise = (verifyToken, async (req, res, next) => {
  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename })
  data.message != "error" && res.send(data)
})

exports.findcompanywise = (verifyToken, async (req, res, next) => {
  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname })
  data.message != "error" && res.send(data)
})

exports.findstudentwise = (verifyToken, async (req, res, next) => {
  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber, placementcyclename: req.body.placementcyclename })
  data.message != "error" && res.send(data)
})
