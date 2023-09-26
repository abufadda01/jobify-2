const mongoose  =  require("mongoose")


const connectDB = (url) => {
    return mongoose.connect(url , {useUnifiedTopology : true , useNewUrlParser : true})
            .then(() => console.log("JOBIFY DATABASE CONNECTED SUCCESSFULLY"))
            .catch(error => console.log(`FAILED IN CONNECTION TO THE DATABASE ${error}`))
}


module.exports = connectDB

// export default connectDB