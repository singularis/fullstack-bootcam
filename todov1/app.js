const express = require("express");
const bodyParser = require("body-parser");
const {
    reset
} = require("nodemon");



const app = express();
var items = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get("/", function (req, res) {
    var options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var today = new Date();
    res.render('list', {
        kindOfDay: today.toLocaleDateString("en-US", options),
        items: items
    });

});

app.post("/", function (req, res) {
    items.push(req.body.nextItem);
    res.redirect("/");
});




app.listen(8181, function () {
    console.log("server started")
});