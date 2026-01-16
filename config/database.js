//mongooose se connect krne k liye database se
const mongoose = require('mongoose');
require('dotenv').config();

exports.connectDB = () =>{
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => {
        console.log("db connection failed")
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });
}