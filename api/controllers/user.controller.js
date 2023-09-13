import { errorHandler } from "../utils/error.js"
import bcryptjs from "bcryptjs"
import User from "../models/user.model.js"

export const test = (req,res)=>{
    res.json({
        message: "API is working here also"
    })
}

export const updateUser = async(req, res, next)=>{
    if(req.user.id != req.params.id){
        return next(errorHandler(401, "you can only login to your account"))
    }
    try {
        if(req.body.password){
             req.body.password = bcryptjs.hashSync(req.body.password, 10)
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set:{
                    username: req.body.username,
                    email:req.body.email,
                    password:req.body.password,
                    profilePicture: req.body.profilePicture
                }
            },
            {new:true},
        );
        const {password, ...others} = updatedUser._doc
            res.status(200).json(others)

        
    } catch (error) {
        next(error)
    }

}

export const deleteUser = async(req, res,next)=>{
    if(req.user.id != req.params.id){
        return next(errorHandler(401, "you can only delete to your account"))
    }
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json("User has been deleted...")

    } catch (error) {
        next(error)
    }
}

