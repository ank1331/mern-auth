import { log } from "console";
import express from "express";
import mongoose from "mongoose"
import dotenv from "dotenv";
dotenv.config()

mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log("connected to Mongo db")
})
.catch((err)=>{
    console.log(err)
})

const app = express()


app.listen(3000, ()=>{
    console.log("listening on 3000!");
})