const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');

//==============================================
// OTP Sending Logic:-
//step1-> fetch email from req body
//step2-> validate email
//step3-> check if email already exists in User collection
//step4-> generate unique OTP
//step5-> store OTP in database(qki jb email se otp user dalega toh use compare v toh krna hoga nn)
//step6-> send response
//==============================================
exports.sendOTP = async (req, res) => {
    try {
        // Step 1: Fetch email from request body
        const { email } = req.body;

        // Step 2: Validation - Check if email is provided
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Step 3: Validate email format (basic validation)
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            });
        }
        // Step 4: Check if email already exists in User collection
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered. Please login or use a different email"
            });
        }

        // Step 5: Generate unique OTP (6 digits)
        let otp;
        let otpExists = true;
        
        while (otpExists) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            
            // Check if this OTP already exists (to ensure uniqueness)
            const existingOTP = await OTP.findOne({ otp });
            if (!existingOTP) {
                otpExists = false;
            }
        }

        // Step 6: Store OTP in database (pre-save hook will send email)
        const otpDocument = await OTP.create({
            email,
            otp
        });

        // Step 7: Send response
        res.status(200).json({
            success: true,
            message: "OTP sent successfully to your email",
            otp // Optional: remove in production for security
        });

    } catch (error) {
        console.error("Error in sendOTP:", error);
        res.status(500).json({
            success: false,
            message: "Error sending OTP",
            error: error.message
        });
    }
};


//==============================================
// Signup Logic
//step1-> fetch data from req body
//step2-> data validations
//step3-> check if password and confirmPassword are same
//step4-> check if user already exists
//step5-> find most recent OTP from DB corresponding to that email
//step6-> validate OTP
//step7-> hash the password
//step8-> create the entry in DB for the user
//==============================================
exports.signup = async (req, res) => {
    try {
        // Step 1: Fetch data from request body
        const { firstName, lastName, email, password, confirmPassword, accountType, otp } = req.body;

        // Step 2: Data validations
        if (!firstName || !lastName || !email || !password || !confirmPassword || !accountType || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Step 3: Check if password and confirmPassword are same
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match"
            });
        }

        // Step 4: Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Step 5: Find most recent OTP from DB corresponding to that email
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        // Step 6: Validate OTP
        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP"
            });
        }

        if (otp !== recentOtp.otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Step 7: Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Step 8: Create the entry in DB for the user
        // Create Profile first (required by User schema)
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        // Send response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: newUser
        });

    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({
            success: false,
            message: "Error during signup",
            error: error.message
        });
    }
};


//==============================================
//Login logic
//step1-> fetch email and password from req body
//step2-> data validations
//step3-> check if email exists in User collection
//step4-> compare password with hashed password in DB
//step5-> generate JWT token
//step6-> create cookie
//step7-> send response
//==============================================
exports.login = async (req, res) => {
    try {
        // Step 1: Fetch email and password from request body
        const { email, password } = req.body;

        // Step 2: Data validations
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Validate email format (basic validation)
        if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Step 3: Check if email exists in User collection
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email does not exist. Please signup first"
            });
        }

        // Step 4: Compare password with hashed password in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Step 5: Generate JWT token
        const token = require('jsonwebtoken').sign(
            {
                id: user._id,
                email: user.email,
                accountType: user.accountType
            },
            process.env.JWT_SECRET || 'your-secret-key',
            {
                expiresIn: '7d'
            }
        );

        // Step 6: Create cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Step 7: Send response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                accountType: user.accountType
            }
        });

    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({
            success: false,
            message: "Error during login",
            error: error.message
        });
    }
};





//==============================================
// Change Password Logic
//step1-> fetch userId, old password, new password, confirm password from req body
//step2-> data validations
//step3-> find user in database
//step4-> compare old password with hashed password in DB
//step5-> check if new password and confirm password are same
//step6-> hash the new password
//step7-> update password in database
//step8-> send response
//==============================================
exports.changePassword = async (req, res) => {
    try {
        // Step 1: Fetch userId, old password, new password, confirm password from request body
        const { userId, oldPassword, newPassword, confirmPassword } = req.body;

        // Step 2: Data validations
        if (!userId || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        // Step 3: Find user in database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Step 4: Compare old password with hashed password in DB
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        // Step 5: Check if new password and confirm password are same
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        // Check if old password and new password are same
        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password cannot be the same as old password"
            });
        }

        // Step 6: Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Step 7: Update password in database
        user.password = hashedNewPassword;
        await user.save();

        // Step 8: Send response
        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Error in changePassword:", error);
        res.status(500).json({
            success: false,
            message: "Error changing password",
            error: error.message
        });
    }
};
