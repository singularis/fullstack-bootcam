const express = require("express");
const bodyParser = require('body-parser');
const request = require('request');
const https = require("https");
const {
    options
} = require("nodemon/lib/config");
//API b1d404f559bc4d80e848561f92d557a9-us17
//id 75bd513c08
const app = express();

const port = 8181;

app.use(express.static("publics"));

app.use(bodyParser.urlencoded({
    extended: true
}))

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html")
});

app.post("/", function (req, res) {
    var firstName = req.body.firstName;
    var secondName = req.body.secondName;
    var email = req.body.email;


    var data = {
        members: [{
            email_address: email,
            status: "subscribed",
            merge_fields: {
                FNAME: firstName,
                LNAME: secondName
            }
        }]
    };

    const jsonData = JSON.stringify(data);
    const url = "https://us17.api.mailchimp.com/3.0/lists/75bd513c08";

    const options = {
        method: "POST",
        auth: "singularis314:b1d404f559bc4d80e848561f92d557a9-us17",
    };

    const request = https.request(url, options, function (response) {
        var status = response.statusCode;
        if (status == "200") {
            res.sendFile(__dirname + "/success.html")
        } else {
            res.sendFile(__dirname + "/failure.html")
        }
        response.on("data", function (data) {});
    })
    request.write(jsonData);
    request.end();
});

app.post("/failure", function(req,res) {
    res.redirect("/")
})




app.listen(port, function () {
    console.log("server running on port " + port)
});