const { Int32 } = require('mongodb')
const mongoose = require('mongoose')

const walksSchema = new  mongoose.Schema({
    ownerTUID:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    walkerTUID:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    dogTUID:{type:mongoose.Schema.Types.ObjectId, ref:'dog'},
    time:{type:Number, required:true},
    status:{type:String, requred:true},
    lat:{type:Number, required:true},
    lon: {type:Number, required:true}
})


const Walks = mongoose.model('Walks',walksSchema,'walks')

module.exports = Walks