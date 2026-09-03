const bcrypt = require("bcryptjs");
const User = require("../models/user");

class AuthService {
    async registerUser(userData) {
        const { name, email, password }=userData;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
    }
    async login(email,password){
        const user=await User.findOne({email});
        if(!user){
            throw new Error("Invalid Email or Password");
        }
        const ispasswordcorrect=
    }
}
module.exports = new AuthService();