//jshint esversion:6
const dotenv = require('dotenv');
dotenv.config();
const key = process.env.KEY;
const cert = process.env.CERT;
const port = process.env.PORT;
const mongoPasswd = process.env.MONGOPASSWD;
const mongoUser = process.env.MONGOUSER;
const mongoURL = process.env.MONGOURL;
const secret = process.env.SECRET
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const {
    default: mongoose
} = require("mongoose");
const ejs = require("ejs");
const _ = require('lodash');
var fs = require("fs");
var https = require("https");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.locals._ = _;

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}))

app.use(passport.initialize());
app.use(passport.session());

const userScheme = new mongoose.Schema({
    email: String,
    password: String
});

const mongoConnect = "mongodb+srv://" + mongoUser + ":" + mongoPasswd + "@" + mongoURL + "/userDB"

mongoose.connect(mongoConnect);

userScheme.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userScheme);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



https
    .createServer({
            key: fs.readFileSync(key),
            cert: fs.readFileSync(cert),
        },
        app
    )
    .listen(port, function () {
        console.log(
            "API listening! Go to https://URL:", port
        );
    });

app.get("/", function (req, res) {
    res.render("home")
})

app.get("/login", function (req, res) {
    res.render("login")
})

app.get("/register", function (req, res) {
    res.render("register")
})

app.get("/secrets", function(req, res){
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login")
    }
})

app.post("/register", function (req, res) {

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })


})
app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function(err) {
        if (err) {
            console.log(err);
        }
        else 
        {
            passport.authenticate("local");
            res.redirect("/secrets")
        }
        
    })

})

app.get("/logout", function(req, res, next){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})