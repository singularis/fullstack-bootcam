const express = require("express");
const bodyParser = require("body-parser");

const app =express();
app.use(bodyParser.urlencoded({extended: true}))

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html")
});

app.post("/", function(req, res){
    var num1 = req.body.num1;
    var num2 = req.body.num2;
    var result = Math.pow(num1, num2);
    res.send("Result " + result)
});

app.get("/bmi", function(req, res){
    res.sendFile(__dirname + "/bmiCalculator.html")
});

app.post("/bmi", function(req, res){
    var height = req.body.height/100;
    var wight = req.body.wight;
    var result = (wight/Math.pow(height, 2)).toFixed(2);
    res.send("Your BMI is " + result)
});

app.listen(8181, function(){
    console.log("server started")
});