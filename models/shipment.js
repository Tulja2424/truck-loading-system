const mongoose=require('mongoose');
let shipmentSchema=mongoose.Schema({
    warehouse_id:{type:mongoose.Schema.Types.ObjectId,ref:'warehouse'},
       weight:Number,
       boxes:Number,
       destination:String,
       source:String,
       start:Date,
       end:Date,
});
module.exports=mongoose.model('shipment',shipmentSchema);