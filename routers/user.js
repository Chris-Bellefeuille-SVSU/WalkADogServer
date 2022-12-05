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

    let username = req.body.username
    let password = req.body.password
    //step 1
    const user = await User.findOne({username: username})
    if (!user) {
        res.redirect('/')
    }
    //step 2
    const isMatch = await bcrypt.compare(password,user.password)

    //step 3
    console.log(isMatch)
    if (isMatch){
        req.session.user_id = user._id
        res.redirect('/dashboard')
    }
    else
        res.redirect('/')

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
