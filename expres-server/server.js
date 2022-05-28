const express = require("express");

const app =express();

app.get("/", function(req, res){
    res.send("<h1>tes1t</h1>")
});

app.listen(80, function(){
    console.log("server started")
});