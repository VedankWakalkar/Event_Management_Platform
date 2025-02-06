const jwt =require("jsonwebtoken")
const dotenv=require("dotenv");
dotenv.config();

const guestMiddleware=(req,res,next)=>{
    const token =req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(404).json({
            message:"Unauthorized: No token provided"
        })
    }
    try{

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(decoded.role==="guest"){
            req.user={
                role:"guest"
            }
        }else{
            req.user=decoded
        }
        next();
    }catch(error){
        console.error("Some Error Occured: ",error);
        res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

module.exports={
    guestMiddleware
}