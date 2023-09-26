// import mongoose  from "mongoose"
const mongoose  =  require("mongoose")



const jobSchema = new mongoose.Schema({
    company : {
        type : String ,
        required : [true , "please provide company"] ,
        maxlength : 20
    },
    position : {
        type : String ,
        required : [true , "please provide position"] ,
        maxlength : 100
    },
    status : {
        type : String ,
        enum : ['interview' , 'declined' , 'pending'] ,
        default : 'pending'
    },
    jobType : {
        type : String ,
        enum : ['full-time' , 'part-time' , 'remote' , 'internship'] ,
        default : 'full-time'
    },
    jobLocation : {
        type : String ,
        default : 'my city' ,
        required : true
    },
    createdBy : {
        // reference id (NORMALIZATION)
        type : mongoose.Schema.Types.ObjectId ,
        ref : "users" ,
        required : [true , "please provide the user"]
    },
} , {timestamps : true})




const Job = mongoose.model("jobs" , jobSchema)



module.exports = Job

// export default Job