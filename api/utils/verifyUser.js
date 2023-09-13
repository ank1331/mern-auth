import { errorHandler } from "./error.js"
import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next)=>{
    const token = req.cookies.access_token;
    console.log(token)
    if(!token) return next(errorHandler(401, "Access denied"))

    jwt.verify( token, "secret", (err, user)=>{
        if(err) {return next(errorHandler(401, "Access Denied"))}

        req.user = user

        next()
    })

}