const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt=require("jsonwebtoken");
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
        const ispasswordcorrect=await bcrypt.compare(password,user.password);
        if(!ispasswordcorrect){
            throw new Error("Invalid Password");
        }
         const token = jwt.sign(
            {
                userId: user._id,
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
                email: user.email,
                role: user.role
            }
        };
    }
}
module.exports = new AuthService();