const express=require('express');
const bodyParser=require('body-parser');
const nodemailer=require('nodemailer');
const mongoose=require('mongoose');
const fetch=require('node-fetch');
const session=require('express-session');
const axios=require('axios');
const http=require('https');
const State=require("country-state-city").State;
const {Vonage}=require('@vonage/server-sdk');
const {City}=require("country-state-city");
require('dotenv').config();
const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(session({
  secret:process.env.SECRET_KEY,
  resave:false,
  saveUninitialized:true
}));
mongoose.connect("mongodb+srv://aadityatyagi975:"+process.env.ATLAS_PASS+"@cluster0.n76ryam.mongodb.net/emergitrack",{useNewUrlParser:true});
const userSchema=new mongoose.Schema({
  name:String,
  email:String

});
const RegisteredHospital=new mongoose.Schema({
  hospitalName:String,
  hospitalAddress:String,
  password:String,
  patient:[{
    patientName:String,
    patientNum:String,
    patientAddress:String,
    patientStatus:String,
    ambuTrack:String
  }],
  driver:[{
    driverName:String,
    driverNum:String,
    driverId:String,
    driverPass:String,
    driverStatus:String,
    patientAssign:String
  
  }]
});
const hospitallist=mongoose.model("hospitallist",RegisteredHospital);
const user=mongoose.model("user",userSchema);