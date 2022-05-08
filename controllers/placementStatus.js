
const verifyToken = require("./verifyToken")
const manageData = require('./manageData')
const placementStatus = require('../models/placementStatus')
const placementDetails = require('../models/placementDetails')
const studentData = require('../models/studentData')
const crypto = require("crypto")
const mail = require("./sendmail")

exports.sendmail = (verifyToken, async (req, res, next) => {
  var sendlist = []
  placementDetails.findOne(
    {
      organisation_id: req.body.organisation_id,
      placementcyclename: req.body.placementcyclename,
    },
    (epla, placename) => {
      studentData.find({ organisation_id: req.body.organisation_id }, (error, data) => {
        data = data.filter((a) =>
          a.eligibleplacementcycles.some(
            (f) => (f[0].placementcyclename == req.body.placementcyclename && f[0][req.body.placementcyclename] == "yes")
          )
        )
        data = data.filter((a) =>
          req.body.eligibilties.some(
            (f) => f[0].course == a.course && f[0].department == a.department
          )
        )
        data = data.filter(
          (e) =>
            e.verified == "yes" &&
            e.freeze == "no" &&
            (req.body.gender != "malefemale"
              ? req.body.gender == e.gender
              : req.body.gender.includes(e.gender))
        )
        if (req.body.backlogs != "no" && req.body.totalbacklogs != 0) {

          data = data.filter(
            (a) => (a.ongoingbacklogs == '' &&
              a.totalbacklogs == '') ||
              (a.ongoingbacklogs <= req.body.ongoingbacklogs &&
                a.totalbacklogs <= req.body.totalbacklogs)
          )

        }

        else if (req.body.backlogs == "no") {

          data = data.filter((a) => a.ongoingbacklogs == 0 || a.ongoingbacklogs == '')
        }
        data.forEach((a) => {
          if (
            a.tenthcgpa * 10 >= req.body.ten &&
            (a.intercgpa * 10 >= req.body.inter ||
              a.intercgpa * 10 - 5 >= req.body.diploma) &&
            a.cgpa * 10 >= req.body.undergraduate
          ) {
            sendlist.push({ mail: a.mail, rollnumber: a.rollnumber })
          }
        })

        placementStatus.find(
          { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname },
          (err, maildat) => {

            if (!err) {

              sendlist = sendlist.filter((a) =>
                maildat.every(
                  (f) => (f.rollnumber != a.rollnumber)
                )
              )





              var finalist = [],
                maildata = [],
                maxvalue = 0,
                k
              if (req.body.maximum != "" && maildat.length != 0) {
                if (maildat.length > 2) {
                  for (let i = 0; i < maildat.length; i++) {
                    c = 0
                      ; (maxvalue = maildat[i].package), (k = i)
                    for (let j = i + 1; j < maildat.length; j++) {
                      c++
                      if (maildat[i].mail == maildat[j].mail) {
                        if (maxvalue < maildat[j].package) {
                          maxvalue = maildat[j].package
                          k = j
                        }
                        if (j + c == maildat.length) {
                          maildata.push(maildat[k])
                        }
                      } else if (j == maildat.length) {
                        maildata.push(maildat[k])
                      }
                    }
                  }
                } else {
                  maildata = maildat
                }
                maildata.map((m) =>
                  sendlist.map((s) =>
                    s.mail == m.mail
                      ? m.package < req.body.maximum
                        ? finalist.push(s)
                        : null
                      : finalist.push(s)
                  )
                )
              } else {
                finalist = sendlist
              }
              const token = crypto.randomBytes(32).toString("hex")
              var mailist = []
              for (let c of finalist) {
                (c.companyname = req.body.companyname),
                  (c.joblocation = req.body.joblocation),
                  (c.placementcyclename = req.body.placementcyclename),
                  (c.registered = "no"),
                  (c.organisation_id = req.body.organisation_id),
                  (c.placed = "-"),
                  (c.date = new Date()),
                  (c.token = token),
                  (c.package = "-"),
                  (c.offerletter = "-"),
                  (c.placeddate = "-"),
                  (c.offerstatus = "-"),
                  (c.offerdate = "-"),
                  (c.verifiedoffer = "-"),
                  (c.rejectedat) = "-"
                c.placementcode = placename.code,
                  c.companycode = req.body.code
                c.type = req.body.type
                c.companylocation = "-"
                mailist.push(c.mail)
              }
              let mailDetails = {
                from: req.body.created,
                to: mailist,
                subject: `ARIKYA - Open for Applications of ${req.body.companyname}`,
                html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.companyprofiletitle}</b> - <b>${req.body.positiontype}</b>
<a href="http://localhost:4200/registration/${token}/${placename.code}/${req.body.code}/${req.body.organisation_id}">click here</a> to register.
For more details login to arikya</p><br/> Best Regards<br/> <b>ARIKYA<br/></b>`,
              }

              let mailcontent = `Applications are now being accepted for ${req.body.companyname}. Jobprofile : ${req.body.companyprofiletitle} - ${req.body.positiontype} - click here to register.For more details login to arikya.Best Regards-mits-Placements office`
              collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }

              mail(mailDetails, collectmail) ? console.log(err) : (

                placementStatus.create(finalist, (errors, md) => {
                  res.send({ message: 'success' })
                })
              )
            }
          }
        )
      })
    }
  )
})

exports.eligible = (verifyToken, async (req, res, next) => {
  var sendlist = [];
  placementDetails.findOne(
    {
      organisation_id: req.body.organisation_id,
      placementcyclename: req.body.placementcyclename,
    },
    (err1, docs1) => {
      let elyear = []
      if (docs1) {
        docs1.batch.forEach((e) => elyear.push(e[0].batchvalue))
      }

      console.log("docs1", docs1)

      studentData.find({ organisation_id: req.body.organisation_id }, (error, data) => {
        data = data.filter((a) =>
          req.body.eligibilties.some(
            (f) => f[0].course == a.course && f[0].department == a.department
          )
        )

        console.log("data", data)
        // data = data.filter((a) =>
        //   elyear.some((f) => f == parseInt(a.yearofjoining) + 4)
        // )

        data = data.filter((a) =>
          a.eligibleplacementcycles.some(
            (f) => (f[0].placementcyclename == req.body.placementcyclename && f[0][req.body.placementcyclename] == "yes")
          )
        )


        data = data.filter(
          (e) =>
            e.verified == "yes" &&
            e.freeze == "no" &&
            (req.body.gender != "malefemale"
              ? req.body.gender == e.gender
              : req.body.gender.includes(e.gender))
        )

        if (req.body.backlogs != "no" && req.body.totalbacklogs != 0) {
          data = data.filter(
            (a) => (a.ongoingbacklogs == '' &&
              a.totalbacklogs == '') ||
              (a.ongoingbacklogs <= req.body.ongoingbacklogs &&
                a.totalbacklogs <= req.body.totalbacklogs)
          )
        }

        else if (req.body.backlogs == "no") {
          data = data.filter((a) => a.totalbacklogs == 0 || a.totalbacklogs == '')
        }
        console.log("data", data)

        data.forEach((a) => {
          if (
            a.tenthcgpa * 10 >= req.body.ten &&
            (a.intercgpa * 10 >= req.body.inter ||
              a.intercgpa * 10 >= req.body.diploma) &&
            a.cgpa * 10 >= req.body.undergraduate
          ) {
            sendlist.push({ mail: a.mail, rollnumber: a.rollnumber })
          }
        })

        console.log("Sendlist", sendlist)

        placementStatus.find(
          { organisation_id: req.body.organisation_id },
          (err, maildat) => {
            if (!err) {
              var finalist = [],
                maildata = [],
                maxvalue = 0,
                k
              if (req.body.maximum != "" && maildat.length != 0) {
                if (maildat.length > 2) {
                  for (let i = 0; i < maildat.length; i++) {
                    c = 0
                      ; (maxvalue = maildat[i].package), (k = i)
                    for (let j = i + 1; j < maildat.length; j++) {
                      c++
                      if (maildat[i].mail == maildat[j].mail) {
                        if (maxvalue < maildat[j].package) {
                          maxvalue = maildat[j].package
                          k = j
                        }
                        if (j + c == maildat.length) {
                          maildata.push(maildat[k])
                        }
                      } else if (j == maildat.length) {
                        maildata.push(maildat[k])
                      }
                    }
                  }
                } else {
                  maildata = maildat
                }
                maildata.map((m) =>
                  sendlist.map((s) =>
                    s.mail == m.mail
                      ? m.package < req.body.maximum
                        ? finalist.push(s)
                        : null
                      : finalist.push(s)
                  )
                )
              } else {
                finalist = sendlist
              }
              finalist = finalist.filter(
                (v, i, a) => a.findIndex((t) => t.mail === v.mail) === i
              )
              placementStatus.find(
                {
                  organisation_id: req.body.organisation_id,
                  placementcyclename: req.body.placementcyclename,
                  companyname: req.body.companyname,
                },
                (errs, docsmaildata) => {
                  var registered = docsmaildata.filter(
                    (e) => e.registered == "yes"
                  )
                  var placed = docsmaildata.filter((e) => e.placed == "yes")
                  res.send({
                    data: finalist,
                    rdata: registered,
                    edata: placed,
                  })
                }
              )
            }
          }
        )
      })
    }
  )
})

exports.checktoken = (verifyToken, async (req, res, next) => {


  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcode: req.body.placementcyclename, companycode: req.body.companyname, token: req.body.token }, { _id: 0 });
  let placementdetails = await manageData.getPlacementDetails('findOne', { code: req.body.placementcyclename, organisation_id: req.body.organisation_id }, { _id: 0 });
  let companydetails = await manageData.getCompanyDetails('findOne', { code: req.body.companyname, organisation_id: req.body.organisation_id, placementcyclename: placementdetails.placementcyclename }, { _id: 0 });

  placementstatus.length != 0 ? res.send({ message: "done", placementcyclename: placementdetails.placementcyclename, companyname: companydetails.companyname }) : res.send({ message: "invalid" })
})

exports.checkregistered = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.getPlacementStatus('findOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename, }, { _id: 0 });
  placementstatus ? placementstatus.registered == "yes" ? res.send({ message: "success" }) : null : res.send({ message: "error" })
})

exports.adminplaced = (verifyToken, async (req, res, next) => {
  req.body.placeddate = new Date()
  let placementstatus = await manageData.updatePlacementStatus('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename }, req.body)
  res.send(placementstatus)
})

exports.updateregistered = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.updatePlacementStatus('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename }, { registered: "yes" })
  res.send(placementstatus)
})

exports.addstu = (verifyToken, async (req, res, next) => {
  var finalist = []
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.presentcompany }, { _id: 0 });
  let placed = await placementstatus.filter(e => e.placed == 'yes')
  placed.forEach((pl, ci) => {
    let count = 0
    placementstatus.map((p, i) => (
      (pl.mail == p.mail) && count++
    ))
    if (count == 0) {
      finalist.push({ mail: pl.mail, rollnumber: pl.rollnumber })
    }
    if (ci == placed.length - 1) {
      if (finalist.length > 0) {
        var mailist = []
        finalist.map((e) => mailist.push(e.mail))
        const token = crypto.randomBytes(32).toString("hex")
        finalist.map(f =>

          (c.companyname = req.body.companyname),
          (c.joblocation = req.body.joblocation),
          (c.placementcyclename = req.body.placementcyclename),
          (c.registered = "no"),
          (c.organisation_id = req.body.organisation_id),
          (c.placed = "-"),
          (c.date = new Date()),
          (c.token = token),
          (c.package = "-"),
          (c.offerletter = "-"),
          (c.placeddate = "-"),
          (c.offerstatus = "-"),
          (c.offerdate = "-"),
          (c.verifiedoffer = "-"),
          (c.rejectedat) = "-",
          c.placementcode = docsplace.code,
          c.companycode = req.body.code,
          c.type = req.body.type,

          placementdetails.findOne({ organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename }, (errolace, docsplace) => {
            let mailDetails = {
              from: "Arikya",
              to: mailist,
              subject: `mits - Open for Applications of ${req.body.companyname}`,
              html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.jobprofiletitle}</b> - <b>${req.body.positiontype}</b>
<a href="http://localhost:4200/registration/${token}/${docsplace.code}/${req.body.code}/${req.body.organisation_id}">click here</a> to register.
For more details login to arikya</p><br/> Best Regards<br/> <b>mits<br/>Placements office</b>`,
            }
            let mailcontent = `Applications are now being accepted for ${req.body.companyname}
                Jobprofile : ${req.body.jobprofiletitle} - ${req.body.positiontype}
                click here to register.
                For more details login to arikya.
                Best Regards-mits-Placements office`
            collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
            if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
            else {
              placementStatus.create(finalist, (errors, md) => {
                res.send({ message: 'no students left to send mail' })
              })
            }

          })
        )



      }
      else {
        res.send({ message: "success" })
      }
    }
  })

})

exports.updateplaced = (verifyToken, async (req, res, next) => {
  let updateplacementstatus = ''
  req.body.data.map(async (c, i) => (
    updateplacementstatus = await manageData.updateCollegeData('updateOne', {
      organisation_id: req.body.organisation_id, rollnumber: c.rollnumber, registered: "yes", placementcyclename: c.placementcyclename, companyname: c.companyname,
    }, { placed: "yes", joblocation: c.joblocation, package: c.package }),
    (i == req.body.data.length) && res.send(updateplacementstatus)
  ))
})


exports.applicants = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, registered: "yes" }, { _id: 0 });
  let studentdata = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  studentdata = studentdata.filter(ad => placementstatus.some(fd => fd.mail == ad.mail));
  studentdata.map((e) => e.ongoingbacklogs != "" ? (e.ongoingbacklogs = parseInt(e.ongoingbacklogs)) : (e.ongoingbacklogs = 0))
  res.send(studentdata)
})


exports.dashboard = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  let studentdata = await manageData.getStudentData('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  ds = studentdata.filter((e) => placementstatus.some((d) => d.rollnumber == e.rollnumber))
  res.send({ data: placementstatus, total: studentdata.length, studentdata: ds })
})

exports.checkrollnumber = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, rollnumber: req.body.rollnumber }, { _id: 0 });
  res.send(placementstatus)
})

exports.checkmailnumber = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.getPlacementStatus('find', { mail: req.body.mail }, { _id: 0 });
  res.send(placementstatus)
})

exports.notifyacceptreject = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id }, { _id: 0 });
  (placementstatus.message != 'error') ? (placementstatus == null ? (placementstatus = []) : null,
    (docs1 = placementstatus.filter((e) => (e.offerletter != "" || e.offerletter != null) && (e.placed == "-"))),
    data = [],
    data = placementstatus.filter(d1 => (d1.placed == 'no' || d1.placed == 'yes' || d1.placed == 'onhold')),
    data.sort((a, b) => a.placeddate > b.placeddate ? 1 : -1),
    res.send({ data1: docs1, data2: data })) : res.send({ message: "error" })
})

exports.updateofferletter = (verifyToken, async (req, res, next) => {
  let placementstatusupdate = await manageData.updatePlacementStatus('updateOne', { organisation_id: req.body.organisation_id, mail: req.body.mail, companyname: req.body.companyname }, req.body)
  res.send(placementstatusupdate)
})


exports.singlestudent = (verifyToken, async (req, res, next) => {
  let placementstatus = await manageData.getPlacementStatus('find', { organisation_id: req.body.organisation_id, placementcyclename: req.body.placementcyclename, companyname: req.body.companyname, rollnumber: req.body.rollnumber }, { _id: 0 });
  let collegedata = await manageData.getCollegeData('findOne', { organisation_id: req.body.organisation_id }, { _id: 0, mailvalidation: 1 })
  placementDetails.findOne(
    {
      organisation_id: req.body.organisation_id,
      placementcyclename: req.body.placementcyclename,
    },
    (epla, placename) => {
      if (placementstatus != null && placementstatus.message != 'error' && placementstatus.length == 0) {
        const token = crypto.randomBytes(32).toString("hex")
        let mailDetails = {
          from: "Arikya",
          to: req.body.rollnumber + collegedata.mailvalidation,
          subject: `mits - Open for Applications of ${req.body.companyname}`,
          html: `<p>Applications are now being accepted for <b>${req.body.companyname}</b> Jobprofile : &nbsp;<b>${req.body.jobprofiletitle}</b> - <b>${req.body.positiontype}</b>
      <a href="http://localhost:4200/registration/${token}/${placename.placementcyclename}/${req.body.companyname}">click here</a> to register.
      For more details login to arikya</p><br/> Best Regards<br/> <b>mits<br/>Placements office</b>`,
        }
        let c = {};
          c.companyname = req.body.companyname;
          c.joblocation = req.body.joblocation;
          c.placementcyclename = req.body.placementcyclename;
          c.registered = "no";
          c.organisation_id = req.body.organisation_id;
          c.placed = "-";
          c.date = new Date();
          c.token = token;
          c.package = "-";
          c.offerletter = "-";
          c.placeddate = "-";
          c.offerstatus = "-";
          c.offerdate = "-";
          c.verifiedoffer = "-";
          c.rejectedat = "-"
        c.placementcode = placename.code
        c.companycode = req.body.code
        c.type = req.body.type
        c.companylocation = "-"

        c.rollnumber = req.body.rollnumber

        c.mail = req.body.rollnumber + collegedata.mailvalidation
        let mailcontent = `Applications are now being accepted for ${req.body.companyname}
    Jobprofile :${req.body.jobprofiletitle} -${req.body.positiontype}
    click here to register.
    For more details login to arikya.
    Best Regards-mits-Placements office`
        collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
        if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) } 
        else {
          placementStatus.create(c, (errors, md) => {
            res.send({ message: 'success' })
          })
        }
      }
      else if (placementstatus.message != 'error'  && placementstatus.length != 0) {
        res.send({ message: 'exist' })
      }
    })
})





//send mail to arikya students based on registrations from home page
exports.homequery = (verifyToken, async (req, res, next) => {
  let mailDetails = {
    from: "Arikya",
    to: req.body.mails,
    subject: 'ARIKYA',
    html: req.body.content,
  }
  let mailcontent = req.body.content
  collectmail = { organisation_id: req.body.organisation_id, content: mailcontent, subject: mailDetails.subject }
  if (mail(mailDetails, collectmail)) { res.send({ message: "error" }) }
  else { res.send({ message: 'success' }) }
})


exports.getHiring = (verifyToken, async (req, res, next) => {
  let data = await manageData.getCompanyHirings("find", { organisation_id: req.body.organisation_id, companyname: req.body.companyname, placementcyclename: req.body.placementcyclename })
  var temp = []
  if (data.length > 0) {
    data.forEach(d => {
      if (!temp.includes(d.hiringflowname)) {
        temp.push(d.hiringflowname)
      }

    })
  }
  res.send(temp)
})


