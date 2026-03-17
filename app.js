const express = require('express');
const path = require('path');
const app = express();

const connectDB = require('./config/db');
connectDB();

const truckDealer=require('./models/dealer');
const truckModel=require('./models/truck');
const warehouseUser=require('./models/warehouse');

const cookieParser = require('cookie-parser');
const mongoose=require('mongoose');
const shipmentModel=require('./models/shipment');
const requestModel=require('./models/request');
const PORT = process.env.PORT || 3000;

app.use(cookieParser(process.env.SECRET_KEY));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Home page - role selection
app.get('/', (req, res) => {
    res.render('index');
});

// Warehouse User Signup Page
app.get('/warehouse-signup', (req, res) => {
    res.render('warehouse-signup');
});

// Truck Dealer Signup Page
app.get('/dealer-signup', (req, res) => {
    res.render('dealer-signup');
});
// Handle Truck Dealer Signup
app.post('/dealer-signup', (req, res) => {
    const { name,password, license, contact, address } = req.body;
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,(err,hash)=>{
            let dealer=new truckDealer({
                name:name,
                password:hash,
                license:license,
                contact:contact,
                address:address
            });
            dealer.save();
            res.redirect(`/profile-dealer/${dealer._id}`);
        });
    });
});
//Handle warehouse SignUp
app.post('/warehouse-signup', (req, res) => {
    const { name,password, license, contact, address } = req.body;
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,(err,hash)=>{
            let warehouse=new warehouseUser({
                name:name,
                password:hash,
                license:license,
                contact:contact,
                address:address
            });
            warehouse.save();
            res.redirect(`/profile-warehouse/${warehouse._id}`);
        });
    });
});
//handle login for dealers and warehouse users
app.get('/login',(req,res)=>{
    res.render('login');
});
app.post('/login', async (req, res) => {
    const { license, password } = req.body;

    let user = await truckDealer.findOne({ license });

    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ license: user.license },process.env.JWT_SECRET,{ expiresIn: "1d" });
                res.cookie('token', token);
                return res.redirect(`/profile-dealer/${user._id}`);
            } else {
                return res.redirect('/login');
            }
        });
        return;
    }

    user = await warehouseUser.findOne({ license });

    if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                let token = jwt.sign({ license: user.license },process.env.JWT_SECRET,{ expiresIn: "1d" });
                res.cookie('token', token);
                return res.redirect(`/profile-warehouse/${user._id}`);
            } else {
                return res.redirect('/login');
            }
        });
        return;
    }

    return res.redirect('/login');
});

app.get('/logout/:id',(req,res)=>{
     res.cookie('token','');
     res.redirect('/');
});
app.get('/dealer-edit/:id',(req,res)=>{
    res.render('dealer-edit',{id:req.params.id});
});
app.post('/dealer-edit/:id',async(req,res)=>{
    let {id}=req.params;
    let {name,password,contact,address}=req.body;
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            await truckDealer.findByIdAndUpdate(id,{
                name:name,
                password:hash,
                contact:contact,
                address:address
            });
            res.redirect(`/profile-dealer/${id}`);
        });
    });
});
app.get('/warehouse-edit/:id',(req,res)=>{
    res.render('warehouse-edit',{id:req.params.id});
});
app.post('/warehouse-edit/:id',async(req,res)=>{
    let {id}=req.params;
    let {name,password,contact,address}=req.body;
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async (err,hash)=>{
            await warehouseUser.findByIdAndUpdate(id,{
                name:name,
                password:hash,
                contact:contact,
                address:address
            });
            res.redirect(`/profile-warehouse/${id}`);
        });
    });
});
app.get('/profile-dealer/:id',async (req,res)=>{
    let {id}=req.params;
    let dealer=await truckDealer.findOne({_id:id});
    res.render("profile-dealer",{dealer:dealer});
});
app.get('/profile-warehouse/:id',async (req,res)=>{
    let {id}=req.params;
    let warehouse=await warehouseUser.findOne({_id:id});
    res.render("profile-warehouse",{warehouse:warehouse});
});
app.get('/add-truck/:id',(req,res)=>{
    let {id}=req.params;
    res.render('add-truck',{id:id});
});
app.post('/add-truck/:id',async (req,res)=>{
    let {id}=req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid dealer ID");
    }
    let {model,number,capacity,cost_km,co2_km,cities}=req.body;
    const truckdealer=await truckDealer.findById(id);
    if(!truckdealer){
        return res.status(404).send("Dealer not found");
    }
    let truck=new truckModel({
        model:model,
        number:number,
        capacity:capacity,
        cost_km:cost_km,
        co2_km:co2_km,
        cities: cities.split(',').map(city => city.trim()).map(city => city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()),
        dealer_id:truckdealer._id
    });
    await truck.save();
    if (!truckdealer.trucks) {
      truckdealer.trucks = [];
    }
    truckdealer.trucks.push(truck._id);
    await truckdealer.save();
    console.log(truckdealer);
    res.redirect(`/profile-dealer/${truckdealer._id}`);
});
app.get('/view-trucks/:dealerid',async(req,res)=>{
    let {dealerid}=req.params;
    let dealer=await truckDealer.findById(dealerid).populate('trucks');
    res.render('view-trucks',{dealer:dealer});
});
//delete truck
app.get('/delete/:dealerid/:truckid',async (req,res)=>{
    const {dealerid, truckid}=req.params;
    let truck=await truckModel.findByIdAndDelete(truckid);
    res.redirect(`/view-trucks/${dealerid}`);
});
app.get('/add-shipment/:warehouseid', async (req, res) => {
    const { warehouseid } = req.params;

    const warehouse = await warehouseUser.findById(warehouseid);

    let requests = await requestModel
        .find({
            warehouse_id: warehouseid,
            status: "pending"
        })
        .populate('shipment_id');

    // REMOVE bad old records
    requests = requests.filter(r => r.shipment_id);

    res.render('add-shipment', {
        warehouse,
        requests
    });
});


app.post('/add-shipment/:warehouseid', async (req, res) => {
    const { warehouseid } = req.params;
    const { weight, boxes, destination, source, start,end } = req.body;
    const n_source = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
    const n_destination = destination.charAt(0).toUpperCase() + destination.slice(1).toLowerCase();
    //Create shipment
    const shipment = new shipmentModel({
        warehouse_id: warehouseid,
        weight,
        boxes,
        destination: n_destination,
        source: n_source,
        start,
        end,
        status: "pending"
    });
    await shipment.save();

    // Create request (ONLY warehouse + status)
    const request = new requestModel({
        warehouse_id: warehouseid,
        shipment_id: shipment._id,
        dealer_id: null,
        truck_id: null,
        status: "pending"
    });
    await request.save();

    // Push shipment into warehouse
    await warehouseUser.findByIdAndUpdate(
        warehouseid,
        { $push: { shipments: shipment._id } }
    );

    // Redirect to GET
    res.redirect(`/add-shipment/${warehouseid}`);
});

//Shipment detail and suitable trucks
app.get('/shipment-detail/:warehouseid/:shipmentid', async (req, res) => {
    const { shipmentid } = req.params;

    const shipment = await shipmentModel
        .findById(shipmentid)
        .populate('warehouse_id');

    let trucks = await truckModel
        .find({
            capacity: { $gte: shipment.weight },
            cities: { $all: [shipment.source, shipment.destination] }
        })
        .populate('dealer_id').lean();
    const availableTrucks = [];

    for (const truck of trucks) {
        const requests = await requestModel
        .find({
            truck_id: truck._id,
            status: { $in: ["approved"] }
        })
        .populate('shipment_id')
        .lean();

        let isAvailable = true;

        for (const req of requests) {
            if (
                req.shipment_id &&
                req.shipment_id.start &&
                req.shipment_id.end
            ) {
            // overlap check
                if (
                    shipment.start <= req.shipment_id.end &&
                    shipment.end >= req.shipment_id.start
                ) {
                    isAvailable = false;
                    break;
               }
            }
       }

       if (isAvailable) {
            availableTrucks.push(truck);
       }
    }

    const requests = await requestModel.find({
        shipment_id: shipmentid
    });

    res.render('shipment-detail', {
        shipment,
        trucks: availableTrucks,
        requests
    });
});

app.post('/create-request', async (req, res) => {
    const { truckid, shipmentid, warehouseid } = req.body;

    const truck = await truckModel.findById(truckid);

    //Update existing request for this shipment
    await requestModel.findOneAndUpdate(
        {
            shipment_id: shipmentid,
            warehouse_id: warehouseid,
            status: "pending"
        },
        {
            dealer_id: truck.dealer_id,
            truck_id: truck._id,
            status: "requested"
        }
    );

    // Redirect to add-shipment page
    res.redirect(`/add-shipment/${warehouseid}`);
});
//Track Shipment Status for warehouse
app.get('/track-shipment/:warehouseid',async (req,res)=>{
    const {warehouseid}=req.params;
    const warehouse=await warehouseUser.findById(warehouseid);
    res.render('track-shipment',{warehouse});
});
app.get('/track-shipment/:warehouseid/:status',async (req,res)=>{
    const {warehouseid,status}=req.params;
    const warehouse=await warehouseUser.findById(warehouseid);
    let requests=await requestModel.find({warehouse_id:warehouseid,status:status}).populate('truck_id').populate('shipment_id').populate('dealer_id');
    requests = requests.filter(r => r && r.shipment_id && r.shipment_id._id);
    res.render('track-shipment-status',{requests,warehouse,status});
});
//Getting truck requests on dealer side on Requests option
app.get('/truck-request/:dealerid',async (req,res)=>{
    const {dealerid}=req.params;
    const requests=await requestModel.find({dealer_id:dealerid,status:"requested"}).populate('truck_id').populate('shipment_id').populate('warehouse_id');
    requests.sort((a, b) => {
        if (a.truck_id.number === b.truck_id.number) {
            return new Date(a.shipment_id.start) - new Date(b.shipment_id.start);
        }
        return a.truck_id.number.localeCompare(b.truck_id.number);
    });
    res.render('truck-request',{requests,dealerid});
});
app.post('/accepted-request', async (req,res)=>{
    const {requestid}=req.body;
    const request=await requestModel.findById(requestid);
    request.status='approved';
    await request.save();
    res.redirect(`/truck-request/${request.dealer_id}`);
});
app.post('/rejected-request', async (req,res)=>{
    const {requestid}=req.body;
    const request=await requestModel.findById(requestid);
    request.status='rejected';
    await request.save();
    res.redirect(`/truck-request/${request.dealer_id}`);
});
app.get('/dealer-orders/:dealerid', async (req, res) => {
    const { dealerid } = req.params;

    const requests = await requestModel
        .find({ dealer_id: dealerid, status: { $in: ["approved", "completed"] } })
        .populate('truck_id')
        .populate('shipment_id')
        .populate('warehouse_id').lean();
    const orders = requests.filter(r => r && r.shipment_id && r.shipment_id._id);
    res.render('dealer-orders', { orders ,dealerid});
});

app.post('/completed-order', async (req, res) => {
    const { requestId ,dealerid} = req.body;

    await requestModel.findOneAndUpdate(
        { _id: requestId, status: { $ne: "completed" } }, // 👈 block re-update
        { status: "completed" }
    );

    res.redirect(`/dealer-orders/${dealerid}`);
});
 

app.get('/edit-truck/:dealerid/:truckid', async (req,res)=>{
    const {dealerid, truckid} = req.params;

    const truck = await truckModel.findById(truckid);

    res.render('edit-truck',{
        dealerid,
        truckid,
        truck
    });
});
app.post('/edit-truck/:dealerid/:truckid', async(req,res)=>{

    const {dealerid, truckid} = req.params;
    let {model,number,capacity,cost_km,co2_km,cities} = req.body;

    cities = cities.split(',').map(c => c.trim());

    await truckModel.findByIdAndUpdate(truckid,{
        model,
        number,
        capacity,
        cost_km,
        co2_km,
        cities
    });

    res.redirect(`/view-trucks/${dealerid}`);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});