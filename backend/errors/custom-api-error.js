const {StatusCodes} = require("http-status-codes")

// custom CustomApiError class that inhert from Error class
class CustomApiError extends Error{
    constructor(message){
        super(message)
    }
}


module.exports = CustomApiError