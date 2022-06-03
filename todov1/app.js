const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const {
    reset
} = require("nodemon");



const app = express();
const items = [];
const workItems = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"))

app.get("/", function (req, res) {
    res.render('list', {
        listTitle: date.getDate(),
        items: items
    });

});

app.get("/work", function (req, res) {
    res.render('list', {
        listTitle: "work list",
        items: workItems
    });
})

app.get("/about", function (req, res) {
    res.render('about', {

    });
})

app.post("/", function (req, res) {
    if (req.body.list == "work") {
        workItems.push(req.body.nextItem);
        res.redirect("/work");
    } else {
        items.push(req.body.nextItem);
        res.redirect("/");
    }
});



app.listen(8181, function () {
    console.log("server started")
});