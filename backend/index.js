const express=require("express")
const cors=require("cors");
const dotenv=require("dotenv")
const mongoose=require("mongoose");
const { userRouter } = require("./routes/userRoutes");
dotenv.config()

const app=express();
app.use(cors())
app.use(express.json())

DATABASE_URL=process.env.DATABASE_URL;
mongoose.connect(DATABASE_URL).then(()=>{
    console.log("Connected to MongoDB!")
}).catch((error)=>{
    console.error("Some error Occured ",error)
})

app.use("/user",userRouter)

const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})