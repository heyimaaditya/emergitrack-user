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
const vonage=new Vonage({
  apiKey:process.env.VONAGE_API_KEY,
  apiSecret:process.env.VONAGE_API_SECRET
})
app.get("/",(req,res)=>{
  res.render("home");
});
app.get("/service",(req,res)=>{
  res.render("service");
})
app.get("/features",(req,res)=>{
  res.render("features");
})
app.get("/aboutUs",(req,res)=>{
  res.render("aboutus");
})
app.get("/contactus",(req,res)=>{
  res.render("contactus");
})
app.get("/book",(req,res)=>{
  res.render("bookNow");
});
app.post("/message",(req,res)=>{
  const name=req.body.name;
  const email=req.body.email;
  const msg=req.body.msg;
  const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
      user:process.env.NODEMAILER_EMAIL,
      pass:process.env.NODEMAILER_PASS
    },
    port:465,
    host:'smtp.gmail.com'
  });
  const mailOption1={
    from:process.env.NODEMAILER_EMAIL,
    to:`${email}`,
    subject:"Ambulance Tracker customer care",
    text:"Thanks For Contacting Us "+`${name}`
  };
  const mailOption2={
    from:process.env.NODEMAILER_EMAIL,
    to:process.env.SECOND_EMAIL,
    subject:`${name}`,
    text:"name:- "+`${name}`+"\n email:- "+`${email}`+"\n message:- "+`${msg}`
  }
  transporter.sendMail(mailOption1,(error,info)=>{
    if(error){
      console.log(error);
      res.send("error sending email");
    }else{
      res.send("email sent succesfully");
    }
  });
  transporter.sendMail(mailOption2,(error,info)=>{
    if(error){
      console.log(error);
      res.send("error sending email");
    }else{
      res.send("email sent successfully");
    }
  });
  user.findOne({email:email}).then(function(elem){
    if(!elem){
      const newUser=new user({
        name:name,
        email:email
      });
      newUser.save();
    }
  }).catch((err)=>{
    console.log(err);
  });
  res.render("message");
});


app.post("/book",(req,res)=>{
  var number=req.body.phone;
  var username=req.body.username;
  //check  if sms has already been sent for this session
  if(req.session.smsSent){
    res.render("verify",{number:number,username:username,code:req.session.code});
  }else{
    var code=Math.floor(Math.random()*999999);
    const from = "Vonage APIs"
    const to ="+91"+number;
    const text='hlo' + username + "this is your verification code:- "+code;
    async function sendSMS(){
      await vonage.sms.send({
        to,from,text
      }).then(resp=>{
        console.log('Message sent successfully');
        console.log(resp);
        res.session.smsSent=true;
        req.session.code=code;
        res.render("verify",{number:number,username:username,code:code});
      }).catch(err=>{
        console.log('There was an error sending the messages.');
        console.error(err);
        res.render("error",{error:err});
      });

    }
    sendSMS();
  }
});
app.post("/verify",(req,res)=>{
  var userName=req.body.userName;
  var phoneNumber=req.body.phoneNumber;
  var enterCode=req.body.code;
  var code=req.body.realCode;
  var count=0;
  if(enterCode==code){
    var allState=(State.getStatesOfCountry("IN"));
    var allCities={};
    for(var i=0;i<allState.length;i++){
      var city=City.getCitiesOfState("IN",allState[i].isoCode);
      allCities[allState[i].name]=city;
    }
    var allCitiesString=JSON.stringify(allCities);
    res.render("location",{allState:allState,allCitiesString:allCitiesString,userName:userName,phoneNumber:phoneNumber});
  }else{
    count++;
    if(count==3){
      res.redirect("/book");
    }else{
      res.render("verify",{Username:userName,number:phoneNumber});
    }
  }
});