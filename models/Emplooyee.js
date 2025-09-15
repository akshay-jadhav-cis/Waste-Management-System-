const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    age: {
        type: Number,
        required: true,
        min: 18
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true
    },
    joiningDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    password:{
        type:String,
        required:true,
        min:6
    },
    count:{
        type:Number,
        default:0,
    }
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
