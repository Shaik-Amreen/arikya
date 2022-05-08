const Studentdata = require("../models/studentData")
const Practice = require("../models/codeQuiz")
const codequiz = require("./codeQuiz")
const { count } = require("console")
const manageData = require("./manageData")
const verifyToken = require("./verifyToken")

dashboarcodedata = (verifyToken, async (req, res) => {
  doc = await manageData.getCodeQuiz("find", { organisation_id: req.body.organisation_id, type: "code" })
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); let main = [], branch = ["cse", "ece", "eee", "mech", "civil", "cst", "mba", "mca",], hell = [], sum, a, tempdata = {}
  doc1.map((d) => doc.map((documents) => documents.ratings.map((e) => e.mail == d.mail && main.push({ dept: d.department, ...e }))))
  branch.map((e) => ((sum = 0), (a = []), (a = main.filter((s) => s.dept == e)), a.map((ad) => (sum = sum + parseFloat(ad.main))),
    sum > 0 ? hell.push({ type: e, rating: (sum / a.length).toFixed(2), attended: a.length, }) : hell.push({ type: e, rating: 0 })))
  branch.map((e) => {
    mails = []
    conclude = []
    main.map((m) =>
      !mails.includes(m.mail) && m.dept == e ? mails.push(m.mail) : null
    )
    mails.forEach((g, i) => {
      sum = 0
      a = []
      a = main.filter((el) => el.mail == g)
      a.map((ad) => (sum = sum + parseFloat(ad.main)))
      b = g.split("@")
      conclude.push({
        roll: b[0],
        rate: (sum / a.length).toFixed(2),
      })
    })
    tempdata[e] = conclude
  })
  res.send({ message: hell, data: tempdata })
})

dashboarquizdata = (verifyToken, async (req, res) => {
  await codequiz.flushquizrating(req.body.organisation_id, "quiz", async (doc) => {
    doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); let main = [], branch = ["cse", "ece", "eee", "mech", "civil", "cst", "mba", "mca"], hell = [], sum, a, tempdata = {}
    doc1.map((d) => doc.map((documents) => documents.ratings.map((e) => e.mail == d.mail && main.push({ dept: d.department, ...e }))))
    branch.map(
      (e) => (
        (sum = 0),
        (a = []),
        (a = main.filter((s) => s.dept == e)),
        a.map((ad) => (sum = sum + parseFloat(ad.main))),
        sum > 0 ? hell.push({ type: e, rating: (sum / a.length).toFixed(2), attended: a.length, }) : hell.push({ type: e, rating: 0 })
      )
    )
    branch.map((e) => {
      ; (mails = []), (conclude = [])
      main.map((m) =>
        !mails.includes(m.mail) && m.dept == e ? mails.push(m.mail) : null
      )
      mails.forEach((g, i) => {
        sum = 0
        a = []
        a = main.filter((el) => el.mail == g)
        a.map((ad) => (sum = sum + parseFloat(ad.main)))
        b = g.split("@")
        conclude.push({
          roll: b[0],
          rate: (sum / a.length).toFixed(2),
        })
      })
      tempdata[e] = conclude
    })
    res.send({ message: hell, data: tempdata })
  })
})

totaldata = (verifyToken, async (req, res) => {
  await codequiz.flushquizrating(req.body.organisation_id, "codequiz", (doc) => { })
  doc = await manageData.getCodeQuiz("find", { organisation_id: req.body.organisation_id }); doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); let main = [], branch = ["cse", "ece", "eee", "mech", "civil", "cst", "mba", "mca"], hell = []
  doc1.map((d) =>
    doc.map((documents) =>
      documents.ratings.map((e) => e.mail == d.mail ? main.push({ dept: d.department, ...e }) : null)))
  let sum,
    a,
    tempdata = {}
  branch.map(
    (e) => (
      (sum = 0),
      (a = []),
      (a = main.filter((s) => s.dept == e)),
      a.map((ad) => (sum = sum + parseFloat(ad.main))),
      sum > 0
        ? hell.push({
          type: e,
          rating: (sum / a.length).toFixed(2),
        })
        : hell.push({ type: e, rating: 0 })
    )
  )
  branch.map((e) => {
    mails = []
    conclude = []
    main.map((m) =>
      !mails.includes(m.mail) && m.dept == e ? mails.push(m.mail) : null
    )
    mails.forEach((g, i) => {
      sum = 0
      a = []
      a = main.filter((el) => el.mail == g)
      a.map((ad) => (sum = sum + parseFloat(ad.main)))
      b = g.split("@")

      conclude.push({
        roll: b[0],
        rate: (sum / a.length).toFixed(2),
      })
    })
    tempdata[e] = conclude
  })
  res.send({ message: hell, data: tempdata })
})

eachtestratings = (verifyToken, async (req, res) => {
  doc = await manageData.getCodeQuiz("find", { organisation_id: req.body.organisation_id, topic: req.body.topic, type: req.body.type })
  if (doc.length != 0) {
    let data = []
    ratings = doc[0].ratings
    if(ratings){
      ratings.forEach((a) => {
        let x = {}
        x.mail = a.mail
        // console.log(typeof (a.main))
        x.main = Number(a.main).toFixed(3)
        data.push(x)
      });
    }
    let data1 = []
    doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); doc1.map((d) =>
      data.map((d1) => {
        d1.mail == d.mail
          ? (data1.push({ firstname: d.firstname, lastname: d.lastname, middlename: d.middlename, dept: d.department, topic: req.body.topic, rollno: d.rollnumber, course: d.course, currentyear: d.currentyear, ...d1 }))
          : null
      }))
    data1.sort((x, y) => { return parseFloat(y.main) - parseFloat(x.main) })
    data1.map((x, index) => {
      x.rank = index + 1
    })
    if (typeof (res) == 'object') {
      res.send({ data: data1 })
    }
    else {
      return res(data1)
    }
  }
})

alltestratings = (verifyToken, async (req, res) => {
  doc = await manageData.getCodeQuiz("find", { organisation_id: req.body.organisation_id, type: req.body.type })
  data = []
  if (doc)
    doc.forEach(z => {
      let a = z.ratings
      if (a)
        a.forEach(y => {
          let count = 1
          if (!data.find(x => x.mail === y.mail)) {
            let x = {}
            x.mail = y.mail
            x.main = y.main
            x.topics = [z.topic]
            x.mainrates = [y.main]
            x.count = 1
            data.push(x)
          }
          else {
            i = data[data.findIndex(x => x.mail === y.mail)]
            i.count++
            i.topics.push(z.topic)
            i.mainrates.push(y.main)
            i.main = ((parseFloat(i.main) + parseFloat(y.main))).toString();
          }
          count++;
        });
    });
  data.map((a) => (a.main = (parseFloat(a.main) / doc.length).toFixed(3), a.total = doc.length))
  let data1 = []
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); doc1.forEach((d) =>
    data.forEach((dat) => {
      dat.mail == d.mail
        ? (data1.push({ firstname: d.firstname, lastname: d.lastname, middlename: d.middlename, dept: d.department, rollno: d.rollnumber, course: d.course, currentyear: d.currentyear, ...dat }))
        : null
    }
    )
  )
  data1.sort((x, y) => { return parseFloat(y.main) - parseFloat(x.main) })
  data1.map((x, index) => {
    x.rank = index + 1
  })
  if (typeof (res) == 'object') {
    res.send({ data: data1 })
  }
  else {
    return res(data1)
  }
})

stdprofilerating = (verifyToken, async (req, res) => {
  let stdallratedata = {}, stdallcodedata = {}, stdallquizdata = {}, stdeachcoderate = [], stdeachquizrate = [];
  await allcodequiztestratings(req, async (data) => {
    data.map((a) => { (a.mail == req.body.mail) ? stdallratedata = a : null; })
  })
  req.body.type = 'quiz'
  await alltestratings(req, (data1) => {
    data1.map((a) => { (a.mail == req.body.mail) ? stdallquizdata = a : null; });
    if (stdallquizdata && stdallquizdata.topics) {
      stdallquizdata['topics'].map((t, index) => { req.body.topic = t })
    }
  })
  await eachtestratings(req, (data2) => {
    data2.map((a) => { (a.mail == req.body.mail) ? stdeachquizrate.push(a) : null; })
  })
  req.body.type = 'code'
  await alltestratings(req, (data1) => {
    data1.map((a) => { (a.mail == req.body.mail) ? stdallcodedata = a : null; })
    stdallcodedata && stdallcodedata.topics && stdallcodedata.topics.map((t, index) => { req.body.topic = t })
  })
  await eachtestratings(req, (data2) => {
    data2.map((a) => { (a.mail == req.body.mail) ? stdeachcoderate.push(a) : null; })
  })
  console.log("stdallratedata,stdallcodedata, stdeachcoderate,stdallquizdata, stdeachquizrate", stdallratedata, stdallcodedata, stdeachcoderate, stdallquizdata, stdeachquizrate)
  res.send({ stdallratedata: stdallratedata, stdallcodedata: stdallcodedata, stdeachcoderate: stdeachcoderate, stdallquizdata: stdallquizdata, stdeachquizrate: stdeachquizrate })
})


allcodequiztestratings = (verifyToken, async (req, res) => {
  var data1 = []
  //it flush all pending quiz ratings and then procced for all code and quiz ratings
  await codequiz.flushquizrating(req.body.organisation_id, "codequiz", (doc) => { })
  doc = await manageData.getCodeQuiz("find", { organisation_id: req.body.organisation_id }); data = []
  if (doc) {

    doc.forEach(z => {
      let a = z.ratings
      // console.log("aaaaaaaaaaaaaaa", a)
      if (a)
        a.forEach(y => {
          if (!data.find(x => x.mail === y.mail)) {
            let x = {}
            x.mail = y.mail
            x.main = y.main
            x.topics = [z.topic]
            x.mainrates = [y.main]
            x.count = 1
            x.total = doc.length
            data.push(x)
          }
          else {
            i = data[data.findIndex(x => x.mail === y.mail)]
            i.count++
            i.topics.push(z.topic)
            i.mainrates.push(y.main)
            i.main = ((parseFloat(i.main) + parseFloat(y.main))).toString();
          }
        });
    });
  }
  data.map((a) => a.main = (parseFloat(a.main) / doc.length).toFixed(3))
  data1 = []
  doc1 = await manageData.getStudentData("find", { organisation_id: req.body.organisation_id }); doc1.map((d) =>
    data.map((d1) => {
      d1.mail == d.mail
        ? (data1.push({ firstname: d.firstname, lastname: d.lastname, middlename: d.middlename, dept: d.department, rollno: d.rollnumber, course: d.course, currentyear: d.currentyear, ...d1 }))
        : null
    }
    )
  )
  data1.sort((x, y) => { return parseFloat(y.main) - parseFloat(x.main) })
  data1.map((x, index) => {
    x.rank = index + 1
  })
  if (typeof (res) == 'object') {
    res.send({ data: data1 })
  }
  else {
    return res(data1)
  }
})

module.exports = {
  dashboarcodedata,
  dashboarquizdata,
  totaldata,
  eachtestratings,
  alltestratings,
  stdprofilerating,
  allcodequiztestratings
}


// stdprofilerating = (verifyToken, async (req, res) => {
//   let stdallratedata, stdallcodedata, stdallquizdata, stdeachcoderate = [], stdeachquizrate = [];
//   try {
//     await allcodequiztestratings(req, (data) => {
//       data.map((a) => { (a.mail == req.body.mail) ? stdallratedata = a : null; })
//       req.body.type = 'quiz'
//       alltestratings(req, (data1) => {
//         data1.map((a) => { (a.mail == req.body.mail) ? stdallquizdata = a : null; });
//         (stdallquizdata) ?
//           stdallquizdata['topics'].map((t, index) => {
//             req.body.topic = t
//             console.log("kwjb")
//             eachtestratings(req, (data2) => {
//               data2.map((a) => { (a.mail == req.body.mail) ? stdeachquizrate.push(a) : null; })
//               console.log("stdeachquizrate", stdeachquizrate)
//               if (stdallquizdata.topics.length - 1 == index) {
//                 req.body.type = 'code'
//                 alltestratings(req, (data1) => {
//                   data1.map((a) => { (a.mail == req.body.mail) ? stdallcodedata = a : null; })
//                   stdallcodedata.topics.map((t, index) => {
//                     req.body.topic = t
//                     eachtestratings(req, (data2) => {
//                       data2.map((a) => { (a.mail == req.body.mail) ? stdeachcoderate.push(a) : null; })
//                       console.log("stdeachcoderate", stdeachcoderate)
//                       if (stdallcodedata.topics.length - 1 == index) {
//                         res.send({ stdallratedata: stdallratedata, stdallcodedata: stdallcodedata, stdeachcoderate: stdeachcoderate, stdallquizdata: stdallquizdata, stdeachquizrate: stdeachquizrate })
//                       }
//                     })
//                   })
//                 })
//               }
//             })
//           }) : null;
//       })


//     })


//   }
//   catch (error) {
//     console.log("error", error)
//   }

//   // console.log("stdallcodedata",stdallcodedata)

//   // req.body.type='quiz'
//   // await alltestratings(req,(data1)=>{
//   //   data1.map((a)=>{(a.mail==req.body.mail)? stdallquizdata = a:null;})
//   //   stdallquizdata.topics.map((t)=>{
//   //     req.body.topic=t
//   //     eachtestratings(req,(data2)=>{
//   //       data2.map((a)=>{(a.mail==req.body.mail)? stdeachquizrate.push(a):null;})
//   //     })
//   //   })
//   // })

//   // console.log("stdallquizdata",stdallquizdata,"stdallquizdata")
//   // res.send({stdallratedata:stdallratedata,stdallcodedata:stdallcodedata,stdallquizdata:stdallquizdata,stdeachcoderate:stdeachcoderate,stdeachquizrate:stdeachquizrate})

// })