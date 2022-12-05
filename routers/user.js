const express = require("express")
const bcrypt = require('bcrypt')
const User = require("../models/user")
const router = new express.Router()

async function authenticateUser(req,res,next){
    console.log(req.session)
    if(!req.session.user_id){
        console.log("Unauthorized user")
        return res.redirect('/')
    }
    else{
        try {
            const user = await User.findById(req.session.user_id)
            req.user = user
            next()
        }
        catch(e){
            res.send(e)
        }
        
    }
}

router.post('/register', async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let userType = req.body.userType

    try {
        password = await bcrypt.hash(password,8)
        const user = new User({username,password,userType})
        const u = await user.save()
        console.log(u)
    } catch (e) {
        console.log(e)
    }
    res.redirect('/')
})

router.post('/login', async (req, res) => {

    //get the username and password from body of request
    let username = req.body.username
    let password = req.body.password
    //create a result object to hold the boolean isUser and the String userType
    let result = new Object({isUser: false, userType: null})

    //step 1
    const user = await User.findOne({username: username})
    if (!user) {
        //if not a user, isUser is false and send the result back to client
        result.isUser = false
        res.send(result)
    }
    //step 2
    const isMatch = await bcrypt.compare(password,user.password)

    //step 3
    console.log(isMatch)
    if (isMatch){
        //if the password matches, register their session
        req.session.user_id = user._id
        //mark results isUser to true
        result.isUser = true
        //check if the user is an owner or a walker
        if (user.userType === 'owner'){
            //if owner, mark results userType to owner and send result to client
            result.userType = 'owner'
            res.send(result)
        }
        else if (user.userType === 'walker'){
            //if walker, mark results userType to walker and send result to client
            result.userType = 'walker'
            res.send(result)
        }
        
    }
    else{
        //if password doesn't match, set userType to incorrect password
        result.userType = 'Incorrect Password'
        //send the result to the client
        res.send(result)
    }

})

router.get('/dashboard', authenticateUser,async (req, res) => {

  
    res.render('dashboard.ejs',{username:req.user.username})

})

router.get('/topsecret', authenticateUser,async (req, res) => {

   res.send(req.user)

})




router.post('/logout',authenticateUser,(req,res)=>{
    req.session.destroy(()=>{
        console.log("Logged out successfully.")
        res.redirect('/')
    })
})

module.exports = router
