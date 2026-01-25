const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 300, // OTP expires in 5 minutes
    },
});

//function -> to send mails

async function sendVerificationEmail(email, otp) {
    try{
        const mailResponse = await mailSender(email, "Your OTP for verification", `Your OTP is ${otp}. It is valid for 5 minutes.`);
        console.log("Mail sent successfully:", mailResponse);
    }
    catch(error){
        console.log("Error sending email:", error);
        throw error;
    }
}

otpSchema.pre('save', async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})


module.exports = mongoose.model("OTP", otpSchema);


