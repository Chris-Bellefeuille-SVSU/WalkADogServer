const { Int32 } = require('mongodb')
const mongoose = require('mongoose')

const walksSchema = new  mongoose.Schema({
    ownerTUID:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    walkerTUID:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    dogTUID:{type:mongoose.Schema.Types.ObjectId, ref:'Dog'},
    time:{type:Int32, required:true},
    status:{type:String, requred:true}
})


const Walks = mongoose.model('Walks',walksSchema,'walks')

module.exports = Walks