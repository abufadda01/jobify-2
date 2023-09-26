	const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


const userSchema = new mongoose.Schema({
    name : {
        type : String ,
        required : [true , "please fill the name field"] ,
        minlength : 3 , 
        maxlength : 20 ,
        trim : true
    },
    email : {
        type : String ,
        required : [true , "please fill the email field"] ,
        validate : {
            validator : validator.isEmail ,
            message : "please enter a valid email structure"
        },
        unique : true 
    },
    password : {
        type : String ,
        required : [true , "please fill the password field"] ,
        minlength : 6 ,
        // to not share the password value in the returned user document
        select : false
    },
    lastName : {
        type : String ,
        trim :  true , 
        maxlength : 20 ,
        default : "lastName"
    },
    location : {
        type : String ,
        trim : true ,
        maxlength : 20 ,
        default : "my city"
    } 
})



// this.modifiedPaths() return an array
// mongoose hook , before we save the user document 
userSchema.pre("save" , async function(){
    // if we are not modify (update) the password key in the user document
    // to stop the excecution of the rest of pre save hook code
    // to not hashing the password twice and miss up our login functionallty
    if(!this.isModified("password")) return

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password , salt)
    this.password = hashedPassword
})



// mongoose methods to create a function that could be access any place from (user obj from the User class model)
// in general we call this fun to create a new jwt if any of keys inside the payload obj been changed 
userSchema.methods.createJWT = function(){
    return jwt.sign({userId : this._id} , process.env.JWT_SECRET , {expiresIn : process.env.JWT_LIFETIME})
}


userSchema.methods.comparePassword = async function(password){
    const isMatch = await bcrypt.compare(password , this.password)
    return isMatch
}


const User = mongoose.model("users" , userSchema)


module.exports = User