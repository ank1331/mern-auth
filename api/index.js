import { log } from "console";
import express from "express";
import mongoose from "mongoose"
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import cookieParser from "cookie-parser";
import path from "path";
dotenv.config()

mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log("connected to Mongo db")
})
.catch((err)=>{
    console.log(err)
})

const __dirname = path.resolve()

const app = express()

app.use(express.static(path.join(__dirname, "/client/dist")))
app.get("*", (req, res)=>{
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"))
})
app.use(express.json())
app.use(cookieParser())

app.listen(3000, ()=>{
    console.log("listening on 3000!");
})

app.use("/api/user", userRoutes)
app.use("/api/auth", authRoutes)

app.use((err, req, res, next)=>{
    const  statuscode = err.statuscode || 500
    const message = err.message || "Internal Server Error"
    return res.status(statuscode).json({
        success:false,
        message,
        statuscode
    })
})