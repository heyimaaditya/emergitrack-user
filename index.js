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
