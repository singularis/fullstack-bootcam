//jshint esversion:6

const dotenv = require('dotenv');
dotenv.config();
const mongoPasswd = process.env.MONGOPASSWD;
const mongoUser = process.env.MONGOUSER;
const mongoURL = process.env.MONGOURL;
const key = process.env.KEY;
const cert = process.env.CERT;
const port = process.env.PORT;
const express = require("express");
var fs = require("fs");
var https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

const mongoConnect = "mongodb+srv://" + mongoUser + ":" + mongoPasswd + "@" + mongoURL + "/wikiDB"

mongoose.connect(mongoConnect);

const atricleScheme = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "No title specified"]
  },
  content: {
    type: String,
    required: [true, "No String specified"]
  },
});

const Artickle = mongoose.model("Artickle", atricleScheme);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.route("/articles")
  .get(function (req, res) {
    Artickle.find(function (err, foundArticles) {
      if (!err) {
        res.send(foundArticles)
      } else {
        res.send("Error occurs ", err)
      }
    })
  })
  .post(function (req, res) {
    console.log(req.body.title)
    console.log(req.body.content)
    const newArticle = new Artickle({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function (err) {
      if (!err) {
        res.send("Updated mongo successfully")
      } else {
        res.send("Error occurs", err)
      }
    })
  })
  .delete(function (req, res) {
    Artickle.deleteMany(function (err) {
      if (!err) {
        res.send(
          "Secessfully removed all data"
        )
      } else {
        res.send("Error occurs", err)
      }
    })
  })

app.route("/articles/:articleTitle")


  //Specific data
  .get(function (req, res) {
    Artickle.findOne({
      title: req.params.articleTitle
    }, function (err, foundArticles) {
      if (!err) {
        res.send(foundArticles)
      } else {
        res.send("Error occurs ", err)
      }
    })
  })
  .put(function (req, res) {
    Artickle.updateOne({
        title: req.params.articleTitle
      }, {
        title: req.body.title,
        content: req.body.content
      },
      function (err) {
        if (!err) {
          res.send("Successfully update article")
        } else {
          res.send("No data")
        }
      })
  })
  .patch(function (req, res) {
    Artickle.updateOne({
        title: req.params.articleTitle
      }, {
        $set: req.body
      },
      function (err) {
        if (!err) {
          res.send("Successfully update article")
        } else {
          res.send("No data")
        }

      })
  })
  .delete(function (req, res) {
    Artickle.deleteOne({
        title: req.params.articleTitle
      },
      function (err) {
        if (!err) {
          res.send("Successfully deleted article")
        } else {
          res.send("No data")
        }

      })
  });



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