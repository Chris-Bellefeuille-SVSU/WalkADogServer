const express = require("express")
const bcrypt = require('bcrypt')
const User = require("../models/user")
const authenticateUser = require("../middleware/authenticate")
const authenticateUsers = require("../middleware/authenticate")
const Dog = require("../models/dog")
const Walks = require("../models/walks")
const router = new express.Router()


router.get('/homepage/owner', authenticateUsers, async (req,res)=>{
    //get the user id and userType from current user
    let user_id = req.user._id
    let userType = req.user.userType

    //check if the user is a walker
    if (userType === 'walker'){
        //if so send an error message
        res.send({message: 'This page can only be viewed by dog Owners!'})
    }
    try{
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

router.get('/homepage/walker', authenticateUsers, async (req,res)=>{
    //get the user id and userType from current user
    let user_id = req.user._id
    let userType = req.user.userType

    //check if the user is a walker
    if (userType === 'owner'){
        //if so send an error message
        res.send({message: 'This page can only be viewed by dog Walkers!'})
    }
    //otherwise proceed
    else{
        try{
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
    }
    
})

//basically used as a fetch route used in list and map activity on client
router.get('/availableDogs',authenticateUser,async (req,res)=>{
    //get the userType from current user
    let userType = req.user.userType

    //check if the user is a walker
    if (userType === 'owner'){
        //if so send an error message
        res.send({message: 'This page can only be viewed by dog Walkers!'})
    }
    //otherwise proceed
    else{
        try{
            //run a find to find all walks with a status of Need a Walker
            const availableDogs = await Walks.find({status: 'Need a Walker'})

            //send the availableDogs to the client
            res.send(availableDogs)
        }
        catch(e){
            res.send(e)
        }
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
        res.send({isUser: isUser,message:message})
        
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
        res.send({message: message,isUser: isUser})
    }
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

router.post('/makeRequest/:name',authenticateUser,async (req,res)=>{
    //get the user id and userType from current user
    let user_id = req.user._id
    let userType = req.user.userType
    //get the dog name from the url
    let dogName = req.params.name
    //get the time from the body sent from the client
    let time = req.body.time

    //check if the user is a walker
    if (userType === 'walker'){
        //if so send an error message
        res.send({message: 'This page can only be viewed by dog Owners!'})
    }
    //otherwise run the request
    else{
        //create a find to find the dog and get it's id
        const dog = await Dog.find({name: dogName})

        try{
            //create a new walk object with the given dog name and time
            const newWalkRequest = new Walks({
                ownerTUID: user_id,
                walkerTUID: null,
                dogTUID: dog._id,
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
    }
})

router.post('/addDog',authenticateUser,async (req,res)=>{
    //grab the name and breed sent in body of client post
    let dogName = req.body.name
    let dogBreed = req.body.breed
    //get the user id and user type from current user
    let user_id = req.user._id
    let userType = req.user.userType

    //check if the user is a walker
    if (userType === 'walker'){
        //if so send an error message
        res.send({message: 'This page can only be viewed by dog Owners!'})
    }
    //otherwise create and send the new dog
    else{
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
    }
})


router.post('/logout',authenticateUser,(req,res)=>{
    req.session.destroy(()=>{
        console.log("Logged out successfully.")
        res.redirect('/')
    })
})

module.exports = router
