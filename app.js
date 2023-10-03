//jshint esversion:6
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import mongoose from "mongoose"
import bcrypt from "bcrypt"

const saltRounds = 10
const app = express()
const port = 3000

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})


const User = mongoose.model("User", userSchema)

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/logout", (req, res) => {
    res.redirect("/")
})

app.post("/register", (req, res) => {
    const username = req.body.username
    const password = req.body.password
    bcrypt.hash(password, saltRounds, function(err, hash) {
        const newUser = new User({
            email: username,
            password: hash
        })
    
        newUser.save()
        .then(() => {
            res.render("secrets")
        })
        .catch(err => {
            console.log(err)
        })
    });
})

app.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password

    User.findOne({email: username})
    .then(found => {
        if (found) {
            bcrypt.compare(password, found.password, function(err, result) {
                if (result === true) {
                    res.render("secrets")
                } else {
                    console.log("wrong password")
                }
            });
        } else {
            res.send("wrong email")
        }
    })
    .catch(err => {
        console.log(err)
    })
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})