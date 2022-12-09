require('dotenv').config()
const express = require("express")
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const UserRouter = require('./routers/user.js')


const app = express()
const port = process.env.PORT
app.listen(port)

const url = process.env.MONGO_URL
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true

}, (err) => {
    if (err) 
        console.log("Error establishing MongoDB connection!")
    else 
        console.log("Connected to DB")
})



app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use(express.json())



app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: url
    })
}))

app.use(UserRouter)


app.get('/', (req, res) => {
    console.log(req.session)
    res.send('Welcome to the Dog Walker App, please proceed on the App!')


})

