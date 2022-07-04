//npm i express body-parser ejs lodash fs https dotenv mongoose

const dotenv = require('dotenv');
dotenv.config();
const key = process.env.KEY;
const cert = process.env.CERT;
const port = process.env.PORT;
const mongoPasswd = process.env.MONGOPASSWD;
const mongoUser = process.env.MONGOUSER;
const mongoURL = process.env.MONGOURL;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
var fs = require("fs");
var https = require("https");
const {
  default: mongoose
} = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

const mongoConnect = "mongodb+srv://" + mongoUser + ":" + mongoPasswd + "@" + mongoURL + "/secretDB"

mongoose.connect(mongoConnect);

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