const jwt  = require("jsonwebtoken");
const User = require("../model/UserModel");
const express=require("express");
const zod=require('zod')
const bcrypt=require('bcrypt')
const userRouter=express.Router();
const dotenv =require("dotenv");
const { Event } = require("../model/EventModel");
const { authMiddleware } = require("../Middleware");
const session=require("express-session")
dotenv.config();

const JWT_SECRET=process.env.JWT_SECRET;
const userInputSchema=zod.object({
    username:zod.string(),
    email:zod.string().email(),
    password:zod.string()
})

const userLoginSchema=zod.object({
    email:zod.string().email(),
    password:zod.string()
})

const eventCreateSchema=zod.object({
    title: zod.string().min(3, "Title must be at least 3 characters"),
    description: zod.string().min(6, "Description must be at least 6 characters"),
    date: zod.string().refine(val => !isNaN(Date.parse(val)), {
        message: "Invalid date format. Use YYYY-MM-DD"
    }),
    location: zod.string().min(4, "Location must be at least 4 characters"),
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
    
    const token= jwt.sign({_id: newUser._id},JWT_SECRET,{ expiresIn: "1h" });

    res.status(201).json({
        message:"User Created Successfully",
        status:"success",
        token:token,
        user:{
            _id: newUser._id,
            username: newUser.username,
            email: newUser.email
        }
    })}catch(error){
        console.error("Some error Occurred:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

userRouter.post("/api/auth/login",async (req,res)=>{
    try{
        const {success}=userLoginSchema.safeParse(req.body);
        console.log("Zod validation : ",success);
        if(!success){
            return res.status(411).json({
                message:"Invalid Credentials format"
            })
        }
        const user = await User.findOne({
            email:req.body.email
        })
        if(!user){
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
        const token=jwt.sign({_id:user._id},JWT_SECRET,{ expiresIn: "1h" })

        if (!req.session) {
            return res.status(500).json({ message: "Session not initialized" });
        }

        req.session.token = token;
        req.session.userId = user._id;
        console.log("Session Token Stored:", req.session.token);
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
        console.error("Error Occured: ",error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

userRouter.post("/api/auth/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            return res.status(500).json({
                message:"Logout failed"
            })
        }
        res.status(200).json({
            message:"Logged out successfully"
        })
    })
})

userRouter.post("/api/events",authMiddleware,async (req,res)=>{
    try{
        console.log("Session at event creation:", req.session);  // 🔍 Debug
        console.log("Session Token at event creation:", req.session.token);
        const {success}=eventCreateSchema.safeParse(req.body);
        console.log("Zod validation : ",success);
        if(!success){
            return res.status(411).json({
                message:"Invalid Format"
            })
        }
        const existingEvent= await Event.findOne({
            title:req.body.title
        })
        if(existingEvent){
            return res.status(411).json({
                message:"Event has been already registered."
            })
        }

        const newEvent= await Event.create({
            ...req.body,
            createdBy:req.userId
        })

        res.status(201).json({
            message:"Event Created Successfully",
            Event:{
                _id:newEvent._id,
                title:newEvent.title,
                description:newEvent.description,
                date: newEvent.date,
                location: newEvent.location,
                createdBy: newEvent.createdBy
            }
        })
    }catch(error){
        console.error("Error Occured :" ,error);
        res.status(500).json({ message: "Internal Server Error" });
    }
})

userRouter.get("/api/events",async (req,res)=>{
    const events= await Event.find({})
    res.status(201).json({
        Events:events.map(event=>({
            title:event.title,
            description:event.description,
            location:event.location,
            date:event.date,
            createdBy:event.createdBy
        }))
    })
})

userRouter.get("/api/events/:title",async(req,res)=>{
    try{
        const eventTitle= req.params;
        const customEvent= await Event.find({
            title:{
                $regex: new RegExp(eventTitle,"i")
            }
        })
        if(!customEvent){
            return res.status(404).json({
                message:"Event does not exists"
            })
        }
        res.status(201).json({
            message:"Event Found",
            Event:{
                customEvent
            }
        })}
    catch(error){
            console.log("Error occured: ",error)
            return res.status(500).json({
                message:"Internal Server Error "
            })
        }
})

userRouter.put("/api/events/:id",authMiddleware,async(req,res)=>{
    try{
        const {id} =req.params;
        const userId=req.userId;

        const event =await Event.findById(
            id
        )
        if(!event){
            return res.status(404).json({
                message:"Event does not exists"
            })
        }

        if(event.createdBy.toString()!==userId){
            return res.status(403).json({
                message:"You are not authorized to edit this event"
            })
        }
        const updateEvent= await Event.findByIdAndUpdate(id, req.body,{new:true, runValidators: true })
        res.status(200).json({
            message: "Event updated successfully",
            event: updateEvent
        });
    }catch(err){
        console.error("Some Error Occured: ",err);
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

userRouter.delete("/api/events/:id",authMiddleware,async (req,res)=>{
    try{
        const {id}= req.params;
        const userId=req.userId;

        const event = await Event.findById(id)
        if(!event){
            return res.status(404).json({
                message:"Event does not exists"
            })
        }
        if(event.createdBy.toString()!==userId){
            return res.status(403).json({
                message:"You are NOT authorized to Delete the Event"
            })
        }
        await Event.findByIdAndDelete({id})
        res.status(200).json({
            message:"Deleted Event Successfully"
        })
    }catch(error){
        console.error("Some Error Occured: ",error)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

userRouter.post("/api/events/:id/register",authMiddleware,async(req,res)=>{
    try{    
        const {id}=req.params;
        const userId= req.userId;
        const event =await Event.findById(id);
        if(!event){
            return res.status(404).json({
                message:"Event does not exists"
            })
        }    
        if(event.registeredUser.includes(userId)){
            return res.status(400).json({
                message:"User Already Registered"
            })
        }

        event.registeredUser.push(userId);
        await event.save()
        res.status(200).json({
            message:"User Registered to Event Successfully"
        })

    }catch(error){
        console.error("Some Error Occured: ",error);
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

userRouter.get("/api/events/:id/registrations",authMiddleware,async (req,res)=>{
    try{
        const {id}=req.params;
        const userId=req.userId;
        
        const event = await Event.findById(id).populate("registeredUsers", "name email");;
        if(!event){
            return res.status(404).json({
                message:"Event does not exists"
            })
        }
        
        if(event.createdBy.toString()!==userId){
            return res.status(403).json({
                message:"You are not allowed to See to event information!"
            })
        }

        res.status(200).json({
            registeredUser:event.registeredUser
        })

    }catch(error){
        console.error("Some Error Occured: ",error)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

userRouter.get("/api/events/my-events", authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const events = await Event.find({ createdBy: userId });
        
        res.status(200).json({ events });
    } catch (error) {
        console.error("Error occurred: ", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports={
    userRouter
}