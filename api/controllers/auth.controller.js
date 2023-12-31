import User from "../models/user.model.js"
import bcryptjs from "bcryptjs"
import { errorHandler } from "../utils/error.js"
import jwt from "jsonwebtoken"

export const signup = async(req,res, next)=>{
    const {username, email, password} = req.body
    const hashedPassword = bcryptjs.hashSync(password,10)

    const newUser = new User({
        username,
        email,
        password:hashedPassword
    })

    try {
        await newUser.save()

    res.status(201).json({
        message:"User Created Successfully"
    })
    } catch (error) {
        next(error )
    }
}


export const signin = async(req, res, next)=>{
    const {email, password} = req.body
    
    try {
        
        const validuser = await User.findOne({email})
        if(!validuser){
            return next(errorHandler(500,"user not found"))
        }
        const validPassword =  bcryptjs.compareSync(password, validuser.password)
        if(!validPassword){
            return next(errorHandler(500,"user not found"))
        }

        const token = jwt.sign({
            id:validuser._id
        },"secret")
        const {password:hashedPassword, ...rest} = validuser._doc
       
        
        res.cookie("access_token", token, {httpOnly:true }).status(200).json(rest)
    } catch (error) {
        next(error)
        
    }
}

export const google = async(req, res, next)=>{
    try {
        const user = await User.findOne({email:req.body.email})
        if(user){
            const token = jwt.sign({id: user._id}, "secret")
            const {password:hashedPassword, ...rest}  = user._doc
            res.cookie("access_token", token, {httpOnly:true}).status(200).json(rest)
      }
        else{
            const generatedPassword = Math.random().toString(36).slice(-8)+ Math.random().toString(36).slice(-8)
            const hashedPassword = bcryptjs.hashSync(generatedPassword,10)
            const newUser = new User ({
                username: req.body.name.split(" ").join("").toLowerCase()+Math.random().toString(36).slice(-8),
                email: req.body.email,
                password:hashedPassword,
                profilePicture: req.body.photo,
            })
            await newUser.save()
            const token = jwt.sign({id:newUser._id}, "secret")
            const {password:hashedPassword2, ...rest}  = newUser._doc
            res.cookie("access_token", token, {httpOnly:true}).status(200).json(rest)


        }
    } catch (error) {
        next(error)
    }
}

export const signOut = (req, res)=>{
    res.clearCookie("access_token").status(200).json("signout success")

}