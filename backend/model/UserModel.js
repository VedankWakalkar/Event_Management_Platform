const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:email,
        required:true,
        unique:true
    },
    password:{
        type:password,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const User=mongoose.model("User",UserSchema);
module.exports=User;