const {StatusCodes} = require("http-status-codes")


// to handle any errors inside our routes
// err parameter will came from our controlers errors , middlewares , from our controlers we send it by next(error) in the catch block

const errorHandlerMiddleware = (err , req , res , next) => {

    console.log(err)

    const defaultError = {
        // err.statusCode , err.message came from the our handelrs
        statusCode : err.statusCode ||  StatusCodes.INTERNAL_SERVER_ERROR ,
        msg : err.message || "Smth went wrong , please try again"
    }


    if(err.name === "ValidationError"){
        defaultError.statusCode = StatusCodes.BAD_REQUEST
        // Object.values() return an array with the object values without the keys (property_name)
        defaultError.msg = Object.values(err.errors)
        .map((item) => item.message)
        .join(" , ") 
    }


    // check if there is an error code already then check its value
    if(err.code && err.code === 11000){
        defaultError.statusCode = StatusCodes.BAD_REQUEST
        defaultError.msg = `${Object.keys(err.keyValue)} filed has to be unique`
    }


    // in front end we access any of these properties in the catch(error) block by error.response.data.property_name
    res.status(defaultError.statusCode).json({msg : defaultError.msg})

    // res.status(defaultError.statusCode).json({msg : err})
    // console.log(err)
}


module.exports = errorHandlerMiddleware