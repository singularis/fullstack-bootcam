const express = require("express");
const https = require('https');
const bodyParser = require('body-parser');
const urlencoded = require("body-parser/lib/types/urlencoded");

const app = express();

const port = 8181;

app.use(bodyParser.urlencoded({extended: true}))

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.post("/index.html", function (req, res) {
    const city = req.body.cityName
    const api_key = "4322f5a0daa279d2073f1f696d08c07e"
    const units = "metric"
    const url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + api_key + "&units=" + units
    https.get(url, function (response) {
        console.log(response.statusCode)
        response.on("data", function (data) {
            const WeatherData = JSON.parse(data)
            const temp = WeatherData.main.temp
            const description = WeatherData.weather[0].description
            const icon = WeatherData.weather[0].icon
            const imageUrl = "http://openweathermap.org/img/wn/" + icon + "@2x.png";
            console.log(imageUrl)
            res.write("<h1>The temperate in "+city +" is " + temp + "</h1>");
            res.write("<h2>The weather in "+city +" is " + description + "</h2");
            res.write("And the forcast is " + description + "<img src='" + imageUrl + "'>");
            res.write("<p><img src='" + imageUrl + "'><p>");
            res.send();
        })
    })
});




app.listen(port, function () {
    console.log("server running on port " + port)
});