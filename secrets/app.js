//jshint esversion:6
const dotenv = require('dotenv');
dotenv.config();
const key = process.env.KEY;
const cert = process.env.CERT;
const port = process.env.PORT;
const mongoPasswd = process.env.MONGOPASSWD;
const mongoUser = process.env.MONGOUSER;
const mongoURL = process.env.MONGOURL;
const express = require("express");
const encryption = require("mongoose-encryption");
const bodyParser = require("body-parser");
const {
    default: mongoose
  } = require("mongoose");
const ejs = require("ejs");
const _ = require('lodash');
var fs = require("fs");
var https = require("https");

const app = express();

app.set('view engine', 'ejs');

const mongoConnect = "mongodb+srv://" + mongoUser + ":" + mongoPasswd + "@" + mongoURL + "/userDB"

mongoose.connect(mongoConnect);

const userScheme = new mongoose.Schema ({
    email: String, 
    password: String
});
const secret = process.env.SECRET;

userScheme.plugin(encryption, {secret: secret , encryptedFields: ['password']});

const User = new mongoose.model("User", userScheme)

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
app.locals._ = _;


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

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save(function (err) {
        if (err) {console.log(err)}
        else {
            res.render("secrets")
            console.log("User added to DB ", req.body.username)
        }
    })
})
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({email: username}, function(err, foundUser) {
        if (err) {
            console.log(err);
        } else 
        {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets")
                }
            }
        }
    })

})