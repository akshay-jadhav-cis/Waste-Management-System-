const express=require("express");
const history=express.Router();
const Garbage=require("../models/Garbage");
history.get("/", async (req, res) => {
  try {
    const Garbages = await Garbage.find(); 
    res.render("garbage/history", { Garbages });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching history");
  }
});
module.exports=history;