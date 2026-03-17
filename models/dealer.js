const mongoose=require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/truck-loading-system');
//mongoose.connect("mongodb+srv://birlatulja_db_user:Uzr0cl6DAbkUcnLv@cluster0.88az9km.mongodb.net/truckSystem")
//.then(()=> console.log("MongoDB Connected")).catch(err => console.log(err));
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
const dealerSchema=mongoose.Schema({
    name:String,
    password:String,
    license:String,
    contact:Number,
    address:String,
    trucks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'truck' }]
});
module.exports=mongoose.model('dealer',dealerSchema);