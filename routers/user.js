const express = require("express")
const bcrypt = require('bcrypt')
const User = require("../models/user")
const Dog = require("../models/dog")
const Walks = require("../models/walks")
const router = new express.Router()


router.get('/homepage/owner/:username', async (req,res)=>{
    //get the username from the passed in params
    let username= req.params.username

    try{
        //run a find to find the user logged in
        const user = await User.findOne({username: username})

        //get user id from the user
        let user_id = user._id

        //run a find to find all dogs owned by current user
        const userDogs = await Dog.find({ownerID: user_id})

        //run a find to find all dogs that have outgoing walk requests owned by current user
        const userDogRequests = await Walks.find({ownerID: user_id})

        //send the two objects to the client
        res.send({userDogs: userDogs, userDogRequests: userDogRequests})
    }
    catch(e){
        res.send(e)
    }
    
})

router.get('/homepage/walker/:username', async (req,res)=>{
    //get the username from the passed in params
    let username= req.params.username

    try{
        //run a find to find the user logged in
        const user = await User.findOne({username: username})

        //get user id from the user
        let user_id = user._id

        //run a find to find all dogs that are assigned to current user and in progress
        const userInProgressWalks = await Walks.find({walkerTUID: user_id, status: 'In-Progress'})

        //run a find to find all dogs that are assigned to current user and completed
        const userCompletedWalks = await Walks.find({walkerTUID: user_id, status: 'Completed'})

        //send the two objects to the client
        res.send({userInProgressWalks: userInProgressWalks, userCompletedWalks: userCompletedWalks})
    }
    catch(e){
        res.send(e)
    }  
})

//basically used as a fetch route used in list and map activity on client
router.get('/availableDogs/',async (req,res)=>{
    try{
        //run a find to find all walks with a status of Needs a Walker
        const availableDogs = await Walks.find({status: 'Needs a Walker'})

        //send the availableDogs to the client
        res.send(availableDogs)
    }
    catch(e){
        res.send(e)
    }
})

router.post('/register', async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let userType = req.body.userType
    let isUser = false

    const user = await User.findOne({username: username})
    if (user) {
        //if already a user, isUser is true and send the result back to client
        isUser = true
        let message = "Username is already taken!"
        res.send({isUser: isUser,message:message,username:username})
        
    } else {

        try {
            password = await bcrypt.hash(password,8)
            const user = new User({username,password,userType})
            const u = await user.save()
            console.log(u)
        } catch (e) {
            console.log(e)
        }
        let message = "Account successfully created!"
        res.send({isUser: isUser,message:message,username:username})
    }
})

router.post('/login', async (req, res) => {

    //get the username and password from body of request
    let username = req.body.username
    let password = req.body.password
    //create a result object to hold the boolean isUser and the String userType
    let result = new Object({isUser: false, userType: null,username:username})

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

router.post('/takeRequest/:username/:name', async (req,res)=>{
    //get username and dog name from params
    let username = req.params.username
    let dogName = req.params.name

    try {
        //find the dog the user is taking
        const dog = await Dog.findOne({name: dogName})

        //find the user
        const user = await User.findOne({username: username})

        //update the walk request's ownerTUID and status
        await Walks.updateOne({dogTUID: dog._id},{ownerTUID: user._id,status: 'In-Progress'})
    } 
    catch (error) {
        res.send(error)
    }
})

router.post('/makeRequest/:username/:name',async (req,res)=>{
    //get the dog name from the url
    let dogName = req.params.name
    //get the time from the body sent from the client
    let time = req.body.time

    try{
        //find the user from params
        const user = await User.findOne({username: req.params.username})

        let user_id = user._id
    
        //create a find to find the dog and get it's id
        const dog = await Dog.findOne({name: dogName})

        let dog_id = dog._id

        //create a new walk object with the given dog name and time
        const newWalkRequest = new Walks({
            ownerTUID: user_id,
            walkerTUID: null,
            dogTUID: dog_id,
            time: time,
            status: 'Needs a Walker'
        })

        //now save the new walk object and send it
        const result = await newWalkRequest.save()
        res.send(result)
    }
    catch(e){
        res.send(e)
    }
})

router.post('/addDog/:username',async (req,res)=>{
    //grab the name and breed sent in body of client post
    let dogName = req.body.name
    let dogBreed = req.body.breed
    
    //find the user from params
    const user = await User.findOne({username: req.params.username})

    let user_id = user._id

    try {
        //create a dog object with the given dog name and breed
        const newDog = new Dog({
            ownerTUID: user_id,
            name: dogName,
            breed: dogBreed
        })

        //now save the new dog and send it
        const result = await newDog.save()
        res.send(result)
    } 
    catch (e) {
        res.send(e)
    }
})


router.post('/logout',(req,res)=>{
    req.session.destroy(()=>{
        console.log("Logged out successfully.")
        res.redirect('/')
    })
})

module.exports = router
