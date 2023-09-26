const express = require("express")
const router = express.Router()

const { getAllJobs , updateJob , deleteJob , createJob , showStats } = require("../controllers/jobsController")


router.get("/" , getAllJobs)

router.post("/" , createJob)

router.get("/stats" , showStats)

router.patch("/:id" , updateJob)

router.delete("/:id" , deleteJob)


module.exports = router