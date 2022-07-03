var express = require("express");
var fs = require("fs");
var https = require("https");
var app = express();

app.get("/", function (req, res) {
  res.send("hello world");
});

https
  .createServer(
    {
        key: fs.readFileSync("/home/singularis314/ssl/server.key"),
        cert: fs.readFileSync("/home/singularis314/ssl/server.cert"),
    },
    app
  )
  .listen(4433, function () {
    console.log(
      "Example app listening on port 8181! Go to https://localhost:4433/"
    );
  });