const User = require('../models/User.js')

//middleware function to authenticate users
async function authenticateUsers(req,res,next){
    //try catch block to authenticate a user
    try{
        //if the sessions user id exists then we can continue
        if (req.session.user_id){
            //assign user to the current session holder
            const user = await User.findById(req.session.user_id)
            //send it in req.user
            req.user = user
            //move to the next operation
            next()
        }
        else
            //otherwise, their is no user signed in
            res.send({message: 'This page requires you to be logged in'})
    }
    catch(e){
        res.send(e)
    } 
}

module.exports = authenticateUsers