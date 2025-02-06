
const adminMiddleware=(req,res,next)=>{
    if(!req.user|| !req.user.isAdmin){
        return res.status(403).json({
            message:"You are Not the Admin"
        })
    }
    next()
}

module.exports={
    adminMiddleware
}