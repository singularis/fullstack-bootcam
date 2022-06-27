//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoos = require("mongoose");
const _ = require('lodash');
const {
  default: mongoose
} = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemScheme = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "No name specified"]
  },
});

const Item = mongoose.model("Item", itemScheme);

const item1 = new Item({
  name: "List of thinks"
})

const item2 = new Item({
  name: "Hit + to add new "
})

const item3 = new Item({
  name: "Tick to delete"
})

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemScheme]
};

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {
  Item.find(function (err, returnData) {
    if (err) {
      console.log(err)
    } else {
      if (returnData.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err)
          } else {
            console.log("Added default to mongo")
          }
        });
        res.redirect("/")
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: returnData
        });
      }
    }
  });


});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = _.kebabCase(req.body.list)
  const newItem = new Item({
    name: itemName
  });

  if (listName === "today") {
    newItem.save()
    res.redirect("/")
  } else {
    List.findOne({
      name: listName
    }, function (err, foundList) {

      foundList.items.push(newItem)
      console.log("as")
      console.log(foundList)
      foundList.save();
      res.redirect("/" + listName)
    })
  }

});

app.post("/delete", function (req, res) {
  listName = _.kebabCase(req.body.listName)
  checkedItemId = req.body.delete
  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId, function (err, docs) {
      if (err) {
        console.log(err)
      } else {
        console.log("Removed item: ", docs)
      }
    });
    res.redirect("/")
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
        console.log(checkedItemId)
        console.log(listName)
      }
    })
  }

});


app.get('/:listLink/', (req, res) => {
  const userLink = _.kebabCase(req.params.listLink)
  List.findOne({
    name: userLink
  }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: userLink,
          items: defaultItems,
        });
        list.save()
        res.redirect("/" + userLink)
      } else {
        //Show existing list
        res.render("list", {
          listTitle: _.startCase(_.camelCase(userLink)),
          newListItems: foundList.items
        });
      }
    }
  })

})


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(8181, function () {
  console.log("Server started on port 8181");
});