
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const garbageSchema=new Schema({
    garbageType:{
        type:String,
        enum:["dry","water","mix"],
        required:true
    },
    description:{
        type:String,
    },
    image:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
})
const Garbage=mongoose.model("garbage",garbageSchema);
module.exports=Garbage;