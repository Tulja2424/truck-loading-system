const mongoose=require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/truck-loading-system');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
const warehouseSchema=mongoose.Schema({
    name:String,
    password:String,
    license:String,
    contact:Number,
    address:String,
    shipments:[{type:mongoose.Schema.Types.ObjectId,ref:'shipment'}]
});
module.exports=mongoose.model('warehouse',warehouseSchema);