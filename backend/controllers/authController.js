const User = require("../models/userModel")
const {StatusCodes} = require("http-status-codes")
const {CustomApiError , BadRequestError , NotFoundError , UnAuthenticatedError} = require("../errors/index")

// by install express-async-errors package we can remove try&&catch block 
// we use throw new ErrorCustomClass() , and we could access property inside it by err.messasge , err.statusCode inside error-handler middleware




const register = async (req , res) => {
    
    const {name , email , password} = req.body

    if(!name || !email || !password){
        // since we use express-async-errors
        // we get the message in the error-handler middleware by err.message
        // and we get statusCode property from the customError class by err.statusCode
        throw new BadRequestError("please provide all fields")
    }

    const userAlreadyExist = await User.findOne({email})

    if(userAlreadyExist){
        throw new BadRequestError("Email already in use")
    }

    if(password.length <= 6 ){
        throw new BadRequestError("Password length must be at least 6 digits")
    }
    
    const user = new User({
        name ,
        email ,
        password
    })

    const token = user.createJWT()

    await user.save()

    res.status(StatusCodes.CREATED)
    .json({user : {name : user.name , email : user.email , location : user.location , lastName : user.lastName} , token , location : user.location}) 

}



const login = async (req , res) => {
    
    const {name , email , password } = req.body

    if(!email || !password){
        throw new BadRequestError("please provide all fields !")
    }

    // +key_name will provided it again in our document , because in the schema defintion we do not return it
    // -key_name will not iclude it inside the returned document    
    const user = await User.findOne({email}).select("+password")

    if(!user){
        throw new UnAuthenticatedError("Invalid Credentials !")
    }

    const passwordMatch = user.comparePassword(password)
    
    if(!passwordMatch){
        throw new UnAuthenticatedError("Invalid Credentials !")
    }

    const token = user.createJWT()
    // to again remove password key from the returned document 
    user.password = undefined

    res.status(StatusCodes.OK).json({user , token , location : user.location})
}



const updateUser = async (req , res) => {
    const {name , email , location , lastName} = req.body
    
    if(!email || !name || !location || !lastName){
        throw new BadRequestError("Please provide all fields")
    }

    // const user = await User.findOne({_id : req.user.userId})

    const user = await User.findByIdAndUpdate(req.user.userId , {
        name : name ,
        email : email ,
        location : location ,
        lastName : lastName
    } , {new : true})


    await user.save()

    const token = user.createJWT()

    res.status(StatusCodes.OK).json({user , token , location : user.location})

}



module.exports = {register , login , updateUser}