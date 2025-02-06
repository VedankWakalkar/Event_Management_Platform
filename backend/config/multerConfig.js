const multer=require("multer");
const {CloudinaryStorage}=require("multer-storage-cloudinary");
const cloudinary =require("cloudinary");

const storage=new CloudinaryStorage({
    cloudinary:cloudinary,
    params:{
        folder:"Event_App",
        format:async (req, file) => "jpeg",
        public_id: (req, file) => file.fieldname + "-" + Date.now(),
    }
})

const upload = multer({ storage: storage });

module.exports = upload;