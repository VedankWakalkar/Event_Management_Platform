const { jwt } = require("jsonwebtoken");
const User = require("../model/UserModel");

const zod=require('zod')
const userRouter=express.router();

const userInputSchema=zod.object({
    username:zod.string(),
    email:zod.string().email(),
    password:zod.string()
})

const userLoginSchema=zod.object({
    email:zod.string().email(),
    password:zod.string()
})

userRouter.post("/api/auth/register", async (req,res)=>{
    try{
    const {success}=userInputSchema.safeParse(req.body);
    console.log("Zod validation Success : ",success);
    if(!success){
        res.status(411).json({
            message:"Invalid inputs"
        })
    }
    const existingUser= await User.findOne(
        {email:req.body.email}
    )
    if(existingUser){
        return res.status(411).json({
            message:"User Already Registered!"
        })
    }

    const hashedPassword= await bcrypt.hash(req.body.password,12);

    const newUser=await User.create({
        ...req.body,
        password:hashedPassword
    })
    const JWT_SECRET=process.env.JWT_SECRET;
    const token= jwt.sign({_id: newUser._id},JWT_SECRET,{
        expiresIn:'90d'
    });

    res.status(201).json({
        message:"User Created Successfully",
        status:"success",
        token:token,
        user:{
            newUser
        }
    })}catch(error){
        console.error("Some error Occured: ",error)
    }
})

userRouter.post("/api/auth/login",async (req,res)=>{
    try{
        const {success}=userLoginSchema.safeParse(req.body);
        console("Zod validation : ",success);
        if(!success){
            return res.status(411).json({
                message:"Invalid Credentials format"
            })
        }
        const user = await User.findOne({
            email
        })
        if(user){
            return res.status(404).json({
                message:"User Not Found!"
            })
        }
        const isPasswordValid=await bcrypt.compare(req.body.password, user.password)
        if(!isPasswordValid){
            return res.status(411).json({
                message:"Incorrect Password"
            })
        }
        const token=jwt.sign({_id:user._id},JWT_SECRET,{
            expiresIn:"90d"
        })
        res.status(200).json({
            status:"success",
            token:token,
            message:"Logged in Successfully",
            user:{
                _id:user._id,
                username : user.username,
                email:user.email
            }
        })
    }catch(error){
        console.error("Error Occured: ",error)
    }
})


module.exports={
    userRouter
}