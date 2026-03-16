const express = require("express");
const router = express.Router();
const User = require("../models/User");
const SecurityEvent = require("../models/SecurityEvent");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.get("/users", protect, authorize("admin"), async(req,res)=>{

const users = await User.find().select("-password");

res.json(users);

});

router.put("/unlock/:id", protect, authorize("admin"), async(req,res)=>{

await User.findByIdAndUpdate(req.params.id,{
locked:false,
lockUntil:null
});

res.json({message:"User unlocked"});

});

router.get("/events", protect, authorize("admin"), async(req,res)=>{

const events = await SecurityEvent.find().sort({timestamp:-1}).limit(20);

res.json(events);

});

module.exports = router;
