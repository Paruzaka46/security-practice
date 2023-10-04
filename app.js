//jshint esversion:6
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import bodyParser from "body-parser"
import ejs from "ejs"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import session from "express-session"
import passport from "passport"
import passportLocalMongoose from "passport-Local-Mongoose"

const saltRounds = 10
const app = express()
const port = 3000

app.use(express.static("public"))
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    secret: "stanloonayoucunt",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())


mongoose.connect("mongodb://127.0.0.1:27017/userDB")

const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy())

// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())
passport.serializeUser(function(user, done) {
    process.nextTick(function() {
        done(null, { id: user._id, username: user.username });
    });
});
passport.deserializeUser(function(user, done) {
    process.nextTick(function() {
        return done(null, user);
    });
});

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
})

app.get("/register", (req, res) => {
    res.render("register")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/logout", (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

app.post("/register", (req, res) => {
    User.register({username: req.body.username}, req.body.password)
    .then(user => {
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets")
        })
    })
    .catch(err => {
        console.log(err)
        res.redirect("/register")
    })
})

app.post("/login", (req, res) => {
    const user = new User({
        username: req.body.username,
        password : req.body.password
    })

    req.login(user, err => {
        if (err) {
            console.log(err)
            res.redirect("/login")
        } else {
            passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets")
        }
        )}
    })
})

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})