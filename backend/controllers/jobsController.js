const Job = require('../models/jobModel')
const {StatusCodes} = require("http-status-codes")
const {BadRequestError , UnAuthenticatedError , NotFoundError} = require("../errors/index")
const checkPermissions = require("../utils/checkPermissions")
const mongoose = require("mongoose")
const moment = require('moment')


// req.body , req.params , req.query could be an object of values
// so we could extract values from them by using : const {values} = req.body/params/query



const createJob = async (req , res) => {
    
    const {position , company} = req.body

    if(!position || !company){
        throw new BadRequestError("please provide all fields !") 
    }

    // we could create properties inside our req by req.property_name , req.body.property_name
    // create a property inside our req body called createdBy that will contain the userId
    // createdBy : that match the createdBy property in the job document structure that will be a reference id to the user document
    req.body.createdBy = req.user.userId
    
    // our req body could contains the whole fields in the job schema but must always have the position , company . 
    const job = new Job(req.body)
    await job.save()

    res.status(StatusCodes.CREATED).json({job})

}





const getAllJobs = async (req , res) => {

    // get the quries from the url by req.query.query_name or  const {query1 , query2} = req.query
    // in the URL we can define and send query name , value :  ?query_name=query_value&query_name=query_value
    const {status , jobType , search , sort} = req.query


    const queryObject = {
        createdBy : req.user.userId ,
    }


    // check that our status query value not equal "all" so we can get one of our status value ['pending' , 'declined' , 'interview']
    // then create a key inside our queryObj called status that contains our status query value
    // if status value equal "all" we will not create a status key inside our queryObject so we will get all jobs without depending on our status query value
    if(status && status !== 'all'){
        queryObject.status = status 
    }

    if(jobType && jobType !== "all"){ 
        queryObject.jobType = jobType
    }


    // we use $regex opertaor to not match the same exact position value
    // $options : 'i' to ignore case sensitive
    if(search){
        queryObject.position = {$regex : search , $options : 'i'}
    }



    //get all jobs with queryObject filter obj
    let result = Job.find(queryObject)


    // sort the returned document from Job.find() by using .sort("keys_inside_job_schema") mongoose method , 1 : asending , -1 : desending
    if(sort === "latest"){
        result = result.sort("-createdAt")
    }

    if(sort === "oldest"){
        result = result.sort("createdAt")
    }

    if(sort === "a-z"){
        result = result.sort("position")
    }

    if(sort === "z-a"){
        result = result.sort("-position")
    }




    // paggination

    // page for page number
    const page = Number(req.query.page) || 1
    // limit for jobs per page
    const limit = Number(req.query.limit) || 10

    // how many documents that we must skip
    const skip = (page - 1) * limit

    // page 1 , 2 , 3
    // limit 10 , 10 , 10
    // skip 0 , 10 , , 20

    result = result.skip(skip).limit(limit)

    // jobs will be the limited returned number after skip and limit result (jobs per page)
    const jobs = await result
    
    // totalJobs will be the whole returned jobs number without depending on limit , skip , (number of jobs that returns after all sorting quries)
    const totalJobs = await Job.countDocuments(queryObject)


    const numOfPages = Math.ceil(totalJobs / limit)


    res.status(StatusCodes.OK).json({jobs , totalJobs , numOfPages})  

}




const updateJob = async (req , res) => {

    const jobId = req.params.id
    const {company , position} = req.body

    // here we check that we have both comapny , position values in the req body 
    // because they dont have a default value in the job schema
    if(!position || !company){
        throw new BadRequestError("please provide all fields !") 
    }

    const job = await Job.findOne({_id : jobId})
    
    if(!job){
        throw new NotFoundError(`no job with id : ${jobId}`)
    }


    // check permissions
    checkPermissions(req.user , job.createdBy)


    // req.body could contains every thing (any field could be update) but always must have the company , position values 
    // runValidators depnds on our comapny , position values tha t must always been checked
    // findOneAndUpdate() we dont have to use save() after it 
    const updateJob = await Job.findOneAndUpdate({_id : jobId} , req.body , {
        new : true ,
        runValidators : true
    })

  
    res.status(StatusCodes.OK).json({updateJob})

}




const deleteJob = async (req , res) => {
    
    const jobId = req.params.id
    const job = await Job.findOne({_id : jobId})
    
    if(!job){
        throw new NotFoundError(`no job with id : ${jobId}`)
    }
    
    checkPermissions(req.user , job.createdBy)

    await job.deleteOne()
    
    res.status(StatusCodes.OK).json({msg : "Job deleted successfully"})

}





const showStats = async (req , res) => {
    // aggregate : process multiple documents , return a computed result
    // aggregate pipeline contains array of steps (queries) , each step will be an object
    // each $operator  must be inside an object {} , and their values also must be inside an object 
    let stats = await Job.aggregate([
        // $match to get all jobs that match the createdBy user id , we use new mongoose.Types.ObjectId(to convert the user id from a string to object id as the createdBy default strcture)
        {$match : {createdBy : new mongoose.Types.ObjectId(req.user.userId)}} ,
        // $group operator to group them with two properties (_id , count) , _id will contain the $status values , put the $sum of each status group in count property , we use 1 number to be ascending 
        {$group : {_id : "$status" , count : {$sum : 1}}}
    ])



    // acc will contains the final result and has an access to the initial value obj , we must always return it
    // cur has an access to the all array properties that we use
    stats = stats.reduce((acc , cur) => {
        // extract the array object properties by using the cur parameter
        const {_id : title , count} = cur
        // here we create a key&&value inside the acc inital obj that will contain each status name and the count of it
        acc[title] = count
        // at least return the acc obj
        return acc
    } , {})




    // check if we have already a value , then if we dont we can use the zero value
    const defaultStats = {
        pending : stats.pending || 0 ,
        interview : stats.interview || 0 ,
        declined : stats.declined || 0 
    }



    // will be an array of objects after using the aggregate pipeline
    let monthlyApplication = await Job.aggregate([
        {$match : {createdBy : new mongoose.Types.ObjectId(req.user.userId)}},
        // group the returned data as a group with two main properties the _id : that will be an object with two main keys (year , month) => and each one of them will be an object with {$year : '$createdAt'} , {$month : '$createdAt'} operators
        // we could access any key inside the _id object by _id.key_name , _id.year , _id.month
        // and the second main group property will be the count that will be the $sum operator of each _id group(year , month)
        // any key inside our schema we can access it by $key_name
        {$group : {_id : {year : {$year : '$createdAt'} , month : {$month : '$createdAt'}} ,  count : {$sum : 1} } } ,
        
        // then $sort  _id.year , _id.month , (_id is the main object , year and month are two keys inside it) in de-asending way 
        {$sort : {'_id.year' : -1 , '_id.month' : -1}} ,

        // then limit the returned numbers of the documents
        {$limit : 6}
    ])



    // refactor the monthlyApplication data
    monthlyApplication = monthlyApplication.map((item) => {
        const {_id : {year , month} , count} = item
        const date = moment().month(month - 1).year(year).format('MMM Y')
        
        return {date , count} 

    }).reverse()




    res.status(StatusCodes.OK).json({defaultStats , monthlyApplication})

}




module.exports = {createJob , deleteJob , getAllJobs , updateJob , showStats }