const express=require("express");
const { authMiddleware } = require("../Middleware");
const User = require("../model/UserModel");
const { Event } = require("../model/EventModel");

const adminRouter=express.Router();

adminRouter.get("/users",authMiddleware,async(req,res)=>{
    try{
        const users = await User.find();
        res.status(200).json({
            Users:users.map(user=>({
                username:user.username,
                email:user.email,
                createdAt:user.createdAt,
                password:user.password
            }))
        })

    }catch(error){
        console.error("Some Error Occured: ",error)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

adminRouter.get("/events",authMiddleware,async(req,res)=>{
    try{   
        const events= await Event.find({});
        res.status(200).json({
            Events:events.map(event=>({
                title:event.title,
                description:event.description,
                location:event.location,
                createdAt:event.createdAt,
                createdBy:event.createdBy
            }))
        })
    }catch(error){
        console.error("Some Error Occured: ",error)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

adminRouter.delete("/user/:id",authMiddleware,async (req,res)=>{
    try{
        const userId=req.params;
        const userExist= await User.findById(userId);
        if(!userExist){
            return res.status(404).json({
                message:"User dose not exists"
            })
        }

        await User.findByIdAndDelete(userId);
        res.status(200).json({
            message:"User Deleted Successfully"
        })

    }catch(error){
        console.error("Some Error Occured: ",error)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

adminRouter.delete("/events/:id",authMiddleware,async (req,res)=>{
    try{
        const eventId=req.params;
        const eventExist= await Event.findById(eventId);
        if(!eventExist){
            return res.status(404).json({
                message:"Event does not exists"
            })
        }

        await Event.findByIdAndDelete(eventId);
        res.status(200).json({
            message:"Event Deleted Successfully"
        })

    }catch(error){
        console.error("Some error Occured: ",error)
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
})

module.exports={
    adminRouter
}