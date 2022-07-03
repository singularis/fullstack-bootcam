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
const bodyParser = require("body-parser");
const {
  default: mongoose
} = require("mongoose");
const ejs = require("ejs");
const _ = require('lodash');
const posts = [];
var false_page = true;
var fs = require("fs");
var https = require("https");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";


const mongoConnect = "mongodb+srv://" + mongoUser + ":" + mongoPasswd + "@" + mongoURL + "/blogDB"

mongoose.connect(mongoConnect);

const app = express();

const postScheme = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "No name specified"]
  },
  blog: {
    type: String,
    required: [true, "No blog specified"]
  },
});

const Blog = mongoose.model("Blog", postScheme);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.locals._ = _;

app.get("/", function (req, res) {
  Blog.find(function (err, returnData) {
    if (err) {
      console.log(err)
    } else {
      res.render('home', {
        start: homeStartingContent,
        posts: returnData
      });
      console.log(returnData._id) 
    }
  });

})

app.get("/contact", function (req, res) {
  res.render('contact', {
    contact: contactContent
  });
});

app.get('/posts/:postLink/', (req, res) => {
  Blog.find({"_id": req.params.postLink}, function (err, returnData) {
    if (err) {
      res.render('opd', {});
    } else {
      console.log("here")
      console.log(returnData[0].name)
      res.render('post', {
        singleCompose: returnData[0].name,
        singlePost: returnData[0].blog
      });

    }
  });
})

app.get("/about", function (req, res) {
  res.render('about', {
    about: aboutContent
  });
})

app.get("/compose", function (req, res) {
  res.render('compose', {});
})

app.post("/compose", function (req, res) {
  console.log(req.body.nextCompose)
  console.log(req.body.nextPost)
  //Mongo
  const mongoBlog = new Blog({
    name: req.body.nextCompose,
    blog: req.body.nextPost
  })
  Blog.create(mongoBlog, function (err) {
    if (err) {
      console.log(err)
    } else {
      console.log("Added data to mongo")
      res.redirect("/");
    }
  });
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