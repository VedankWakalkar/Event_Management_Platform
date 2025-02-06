const { default: mongoose } = require("mongoose");
const dotenv= require("dotenv");
const User = require("./model/UserModel");
const bcrypt=require("bcrypt")
dotenv.config();

const DATABASE_URL=process.env.DATABASE_URL;

mongoose.connect(DATABASE_URL,{
    useNewUrlParser:true,useUnifiedTopology: true 
}).then(async()=>{
    const hashedPassword=await bcrypt.hash("adminPass",12);
    const adminUser=new User({
        username:"Admin",
        email:"admin@gmail.com",
        password:hashedPassword,
        isAdmin:true
    });
    await adminUser.save();
    console.log("Admin user Created");
    mongoose.connection.close();
}).catch(err=>{
    console.error("Some Error Occured: ",err)
})