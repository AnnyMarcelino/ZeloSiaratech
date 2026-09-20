const express=require('express');
const db=require('../config/db');
const router=express.Router();
router.get('/',async(req,res)=>{try{await db.query('SELECT 1');res.json({status:'ok',service:'zelo-api',database:'connected',time:new Date().toISOString()})}catch(e){res.status(503).json({status:'degraded',service:'zelo-api',database:'unavailable'})}});
module.exports=router;
