const mongoose = require("mongoose")


const connectDB = async ()=>{
  try{
     await mongoose.connect(process.env.DB)
     console.log("db connected successfully")
  }
  catch(error){
   console.log("connection failed..")
  }
}
 


module.exports = connectDB