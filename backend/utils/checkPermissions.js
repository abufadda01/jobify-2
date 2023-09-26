const {UnAuthenticatedError} = require("../errors/index") 


const checkPermissions = (requestUser , resourceUserId) => {
    // if(reqUser.role === "admin") return

    // check that the user id match the job createdBy id that user want to modify it
    // userId will be a string , job.createdBy will be an object so we convert it to a string
    if(requestUser.userId === resourceUserId.toString()) return

    throw new UnAuthenticatedError("Not Authorized to access this route ")
}


module.exports = checkPermissions