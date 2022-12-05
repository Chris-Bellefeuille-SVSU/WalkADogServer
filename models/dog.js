const mongoose = require('mongoose')

const dogSchema = new  mongoose.Schema({
    ownerTUID:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    name:{type:String, required:true},
    breed:{type:String, requred:true}
})


const Dog = mongoose.model('Dog',dogSchema,'dog')

module.exports = Dog