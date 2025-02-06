const express=require("express");
const guestRouter=express.Router();
const jwt = require("jsonwebtoken")
const dotenv=require("dotenv");
const { guestMiddleware } = require("../Middlewares/guestMiddleware");
const { Event } = require("../model/EventModel");
dotenv.config()

guestRouter.post("/api/login",(req,res)=>{
    let guestLoginCount = req.cookies.guestLoginCount || 0;
    if(guestLoginCount>=3){
        return res.status(403).json({
            message:"Login limit reached."
        })
    }
    const guestToken= jwt.sign({role:guest},process.env.JWT_SECRET,{
        expiresIn:"24h"
    })
    res.cookie("guestLoginCount",guestLoginCount+1,{httpOnly:true})
    return res.status(200).json({
        message:"Guest Login Successfully",
        token:guestToken,
        remainingAttempts:3-(guestLoginCount+1)
    })
})

guestRouter.get("/api/event",guestMiddleware,async (req,res)=>{
    try{
        const events=await Event.find({});
        res.status(200).json({
            Events:events.map(event=>({
                title:event.title,
                descriptiom:event.description,
                location:event.location,
                createdAt:event.createdAt,
                createBy:event.createdBy
            }))
        })
    }catch(error){
        console.error("Some Error Occured: ",error);
        return res.status(500).json({
            message:"Some Internal Error"
        })
    }
})

guestRouter.post("/api/events", guestMiddleware, async (req, res) => {
    return res.status(403).json({ message: "Guests are not allowed to create events" });
});

module.exports={
    guestRouter
}