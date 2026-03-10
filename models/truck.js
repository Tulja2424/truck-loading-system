const mongoose=require('mongoose');
const truckSchema=mongoose.Schema({
    model:String,
    number:String,
    capacity:Number,
    cost_km:{type:Number,default:0},
    co2_km:{type:Number,default:0},
    cities:[String],
    dealer_id:{type:mongoose.Schema.Types.ObjectId,ref:'dealer',default:null}
});
module.exports=mongoose.model('truck',truckSchema);