//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
// in place of 127.0.0.1 we can also use localhost but localhost cause problems relalted to collection 
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true});

// Schema declaration
const itemsSchema = new mongoose.Schema({
  name:String
});

//Mongooose model
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item"
});

const item3 = new Item({
  name:"<--- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  
  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err) console.log(err);
        else console.log("Success");
      });
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({name:itemName});

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("Removed Successfully!!");
      res.redirect("/");
    }
  });
});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;
  
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  }); 
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
