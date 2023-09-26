const {UnAuthenticatedError} = require("../errors/index")
const jwt = require("jsonwebtoken")


const auth = async (req , res , next) => {
    const authHeader = req.headers.authorization
    
    // check that we have the authorization header and starts with Bearer
    if(!authHeader || !authHeader.startsWith("Bearer")){
        throw new UnAuthenticatedError("Authenticaiton Invalid !")
    }

    // Bearer vfvrfdbvgrbrgbftbtfbtrhnt
    // split the authHeader value by the space then get the second value that will be the token value
    const token = authHeader.split(" ")[1]
    
    try {
        const payload = jwt.verify(token , process.env.JWT_SECRET)
        // create a property in our req called user that contains our payload obj (user id)
        req.user = {userId : payload.userId}
        next()
    } catch (error) {
        throw new UnAuthenticatedError("Authentication Invalid ! ")
    }

} 


module.exports = auth