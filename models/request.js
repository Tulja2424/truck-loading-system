const mongoose=require('mongoose');
const requestSchema=mongoose.Schema({
    dealer_id:{type:mongoose.Schema.Types.ObjectId,ref:'dealer'},
    truck_id:{type:mongoose.Schema.Types.ObjectId,ref:'truck'},
    shipment_id:{type:mongoose.Schema.Types.ObjectId,ref:'shipment'},
    warehouse_id:{type:mongoose.Schema.Types.ObjectId,ref:'warehouse'},
    status:{type:String,enum:['pending','requested','approved','rejected','completed'],default:'pending'}
});
module.exports=mongoose.model('request',requestSchema);