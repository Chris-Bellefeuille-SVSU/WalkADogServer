const mongoose = require('mongoose')

const userSchema = new  mongoose.Schema({
    username:{type:String, unique:true},
    password:{type:String, required:true},
    userType:{type:String, requred:true}
})


const User = mongoose.model('User',userSchema,'users')

module.exports=User