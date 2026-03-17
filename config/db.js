const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("MongoDB Connected Successfully");

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    
    //Exit process if DB fails (important for Render)
    process.exit(1);
  }
};

module.exports = connectDB;