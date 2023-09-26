const express = require("express")
const router = express.Router()

// import controller functions
const {register , login , updateUser} = require("../controllers/authController")
const authenticateUser = require("../middlewares/auth")

// user routes
router.post("/register" , register)
router.post("/login" , login)
router.patch("/updateUser" , authenticateUser , updateUser)


module.exports = router