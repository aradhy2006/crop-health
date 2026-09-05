const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

class AuthService {

    async registerUser({ name, mobile, password }) {
        const existingUser = await User.findOne({ mobile });

        if (existingUser) {
            throw new Error(
                "User with this mobile number already exists"
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            mobile,
            password: hashedPassword,
            mobileVerified: true,
            role: "FARMER"
        });

        return {
            id: user._id,
            name: user.name,
            mobile: user.mobile,
            role: user.role
        };
    }

    async loginUser(mobile, password) {
        console.log("LOGIN MOBILE:", mobile);
        console.log("DATABASE:", User.db.name);

        const user = await User.findOne({ mobile });

        console.log("USER FOUND:", !!user);

        if (user) {
            console.log("USER ID:", user._id);
            console.log("USER MOBILE:", user.mobile);
            console.log("MOBILE VERIFIED:", user.mobileVerified);
        }

        if (!user) {
            throw new Error("Invalid mobile number or password");
        }

        if (!user.isActive) {
            throw new Error("Account is inactive");
        }

        if (!user.mobileVerified) {
            throw new Error("Mobile number is not verified");
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        console.log("PASSWORD CORRECT:", passwordCorrect);

        if (!passwordCorrect) {
            throw new Error("Invalid mobile number or password");
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                role: user.role
            }
        };
    }
}

module.exports = new AuthService();