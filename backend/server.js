const express = require("express")
const morgan = require("morgan")
// const cors = require("cors")
const expressAsyncErrors = require("express-async-errors")
const authenticateUser = require('./middlewares/auth')
const {dirname} = require("path") 
const {fileURLToPath} = require("url")
const path = require("path")


const app = express()
require("dotenv").config({path : "./.env"})


// import DB connect function
const connectDB = require('./DB/connect')
 


// middlewares
app.use(express.json())
app.use(express.static(path.resolve(__dirname , '../client/build')))


if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev")) 
} 
// cors stands for cross origin resources sharing , allow us to commenicate , call with other different servers
// we can use proxy insted by adding "proxy" : "main-domin" in react package.json file
// app.use(cors()) 



app.get("/" , (req , res) => {
    res.json({msg : "hello from backend"})
})


app.get("/api/v1" , (req , res) => {
    res.json({msg : "main api v1 end point"})
})



// import authRoute route file
// for each "/api/v1/auth" end point will be handeled by authRoute file
// "/api/v1/auth" is the main domin , inside the authRoute file we add the sub-domin
const authRouter = require("./routes/authRouter")
app.use("/api/v1/auth" , authRouter)


// import jobsRoute route file  
// for each "/api/v1/jobs" end point will be handeled by jobsRoute file
// "/api/v1/jobs" is the main domin , inside the jobsRoute file we add the sub-domin , any middlewares , controller file
const jobsRouter = require("./routes/jobsRouter")
app.use("/api/v1/jobs" , authenticateUser , jobsRouter)



// after we try our all routes /jobs , /auth we want to appoint all our get routes to index.html inside the build folder in client folder
app.get("*" , (req , res) => {
    res.sendFile(path.resolve(__dirname , "../client/build" , "index.html"))
})





// custom middlewares
const notFoundMiddleware = require('./middlewares/not-found')
const errorHandlerMiddleware = require('./middlewares/error-handler')

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware) 





const PORT = process.env.PORT || 5000

const start = async () => {
    try {
        app.listen(PORT , () => {console.log(`jobify server started on port ${PORT}`)})          
        await connectDB(process.env.MONGO_URL_COMPASS)      
    } catch (error) {
        console.log(error)
    }
}


start()