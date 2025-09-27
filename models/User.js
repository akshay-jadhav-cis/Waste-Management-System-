
const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true
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
    city:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        default:"India",
    },
    complaints:[{
        type:Schema.Types.ObjectId,
        ref:"Garbage"
    }]

});
const Users=mongoose.model("User",userSchema);

module.exports=Users;