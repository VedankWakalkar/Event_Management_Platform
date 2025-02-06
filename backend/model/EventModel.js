const mongoose=require("mongoose")

const EventSchema= new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            unique:true
        },
        description:{
            type:String,
            required:true
        },
        date:{
            type:Date,
            required:true
        },
        location:{
            type:String,
            required:true
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now
        },
        registeredUser:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        thumbnail:{
            type:String,
            default:null,
        }
    }
)

const Event= mongoose.model("Event",EventSchema);
module.exports={
    Event
}