const express = require("express")
const bcrypt = require('bcrypt')
const User = require("../models/user")
const authenticateUser = require("../middleware/authenticate")
const authenticateUsers = require("../middleware/authenticate")
const router = new express.Router()


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

router.get('/homepage', authenticateUsers, async (req,res)=>{
    let user_id = req.user._id
    
})




router.post('/logout',authenticateUser,(req,res)=>{
    req.session.destroy(()=>{
        console.log("Logged out successfully.")
        res.redirect('/')
    })
})

module.exports = router
