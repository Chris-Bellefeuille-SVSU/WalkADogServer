const mongoose = require('mongoose')

const walksSchema = new  mongoose.Schema({
    ownerTUID:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    walkerTUID:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    dogTUID:{type:mongoose.Schema.Types.ObjectId, ref:'dog'},
    time:{type:Number, required:true},
    status:{type:String, required:true},
    lat:{type:Number, required: true, default: null},
    lon: {type:Number, required: true, default: null}
})


const Walks = mongoose.model('Walks',walksSchema,'walks')

module.exports = Walks