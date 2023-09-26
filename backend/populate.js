import {readFile} from "fs/promises"
import Job  from "./models/jobModel.js"
import connectDB from "./DB/connect.js"

import dotenv from "dotenv"
dotenv.config()

const start = async () => {
    
    try {
        await connectDB(process.env.MONGO_URL_COMPASS)
        await Job.deleteMany()

        // geting the data from the mock-data.json file by using readFile and parse it 
        const jsonJobs = JSON.parse(
            await readFile(new URL("./mock-data.json" , import.meta.url))
        )
        
        await Job.create(jsonJobs)
        
        // const job = new Job(jsonJobs)
        // await job.save()

        console.log("Success !")
        process.exit(0)

    } catch (error) {
        process.exit(1)   
    }
}


start()