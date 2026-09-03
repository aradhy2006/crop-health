const authService = require("../services/authservice");

const register = async (req, res) => {
    try {
        // Guard clause against empty payloads
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing or empty"
            });
        }

        const user = await authService.registerUser(req.body);
        

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });
    } catch (error) {
        // Log the actual error to your Node terminal for instant debugging
        console.error("Registration Error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// login
const login=async(req,res)=>{
    try{
    let {email,password}=req.body;
     if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
    let result=await authService.login(email,password);
    res.status(200).json({
        success:true,
        message:"Login successfull",
        token:result.token,
        user:result.user
    });
}
catch(error){
    res.status(400).json({
        success:false,
        message:error.message
    });
}

};
// protectes /me routes
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
}
module.exports = {
    register,
    login,
    getMe
};