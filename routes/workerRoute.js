const express=require("express");
const workerRoute=express.Router();
const Employee=require("../models/Emplooyee");
const {hashPassword,hashCompare}=require("../utils/password");
const wrapAsync=require("../utils/wrapAsnyc");
const {validateSchema}=require("../middleware");
const {employeeValidationSchema,employeeLoginValidationSchema}=require("../Schema");
workerRoute.get("/employee/signup",(req,res)=>{
  res.render("workers/employeeSignup");
});
workerRoute.post("/employee/signup",validateSchema(employeeValidationSchema),wrapAsync(async(req,res)=>{
        let { name, age, email, password, dob, address } = req.body.Employee;
        const employee = new Employee({
            name,
            age,
            email,
            password:await hashPassword(password),
            dob,
            address,
            joiningDate: new Date() 
        });
        await employee.save();
        res.redirect("/history")
}))
workerRoute.get("/employee/login", (req, res) => {
    res.render("workers/employeeLogin");
});

workerRoute.post("/employee/login",validateSchema(employeeLoginValidationSchema), wrapAsync(async (req, res) => {
        let { email, password } = req.body;
        let employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).send("Employee does not exist");
        }
        let isMatch = await hashCompare(password, employee.password);
        if (!isMatch) {
            return res.status(400).send("Invalid password");
        }
         req.session.employee = employee;
        return res.redirect("/");
}));
workerRoute.post("/employee/logout", (req, res) => {
  req.session.employee = null;
  res.redirect("/");
});

module.exports=workerRoute;