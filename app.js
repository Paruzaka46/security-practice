//jshint esversion:6
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import mongoose from "mongoose"
import encrypt from "mongoose-encryption"

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

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

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

    const newUser = new User({
        email: username,
        password: password
    })

    newUser.save()

    res.render("secrets")
})

app.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password

    User.findOne({email: username})
    .then(found => {
        if (found) {
            if (found.password === password) {
                res.render("secrets")
            }
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