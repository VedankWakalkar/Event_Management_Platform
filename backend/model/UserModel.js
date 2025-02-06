const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    profilePhoto:{
        type:String(),
        default:null
    }
})

const User=mongoose.model("User",UserSchema);
module.exports=User;