// Here i removed your body-parser coz now it's inside express
const express = require("express");
const mongoose = require("mongoose");
 const _ = require("lodash"); // Was used to convert Capitaliztion 
const date = require(__dirname + "/date.js");
const app = express();
 
app.set("view engine", "ejs");
// Here i updated your parser!
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
// Here i updated you mongoose connection link
mongoose.connect("mongodb+srv://ovitanventures:ujLSPRz3I9K2uFHR@cluster0.8kwbg9z.mongodb.net/todolistDB");
// Updated ujLSPRz3I9K2uFHR
const itemsSchema = new mongoose.Schema({
  name: String,
});
 
const Item = mongoose.model("Item", itemsSchema);
 
const item1 = new Item({
  name: "Welcome to your todolist!",
});
// Updated
const item2 = new Item({
  name: "Hit the + button to add a new item.",
});
// Updated
const item3 = new Item({
  name: "<== Hit this box to delete an item.",
});
 
const defaultItems = [item1, item2, item3];
 
const listSchema = {
  name: String,
  items: [itemsSchema],
};
 
const List = mongoose.model("List", listSchema);
 
// app.get("/", function (req, res) {
//   Item.find({}, function (err, foundItems) {
//     if (foundItems.lenght === 0) {
//       Item.insertMany(defaultItem, function (err) {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("Inserted Successfully");
//         }
//       });
//       res.redirect("/");
//     } else {
//       res.render("list", { listTitle: "Today", newListItems: foundItems });
//     }
//   });
// });
app.get("/", async function (req, res) {
  const foundItems = await Item.find({});
 
  if (!(await Item.exists())) {
    await Item.insertMany(defaultItems);
    res.redirect("/");
  } else {
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  }
});
 
/* This to create a dynamic routing for your diffrent web pages */
 
// app.get("/:customName", function (req, res) {
//   const customListName = req.params.customName;
 
//   const list = new List({
//     name: customListName,
 
//     items: defaultItems,
//   });
 
//   list.save();
// });
app.get("/:customListName", async function (req, res) {
  const customListName = _.capitalize(req.params.customListName); // _ was used the capitalize d first letter 
 
  const foundList = await List.findOne({ name: customListName });
  if (!foundList) {
    // Creat a new list
    const list = new List({
      name: customListName,
      items: defaultItems,
    });
    await list.save();
 
    res.redirect("/" + customListName);
  } else {
    // Show an existing list
    res.render("list", {
      listTitle: foundList.name,
      newListItems: foundList.items,
    });
  }
});
// Here i just added async/await function for better practise
app.post("/", async function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
 
  const item = new Item({
    name: itemName,
  });
  if(listName === "Today"){
	    await item.save();
		res.redirect("/");
  }
	else{
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);	
			foundList.save();
			res.redirect("/" + listName);
		});
	}
});
 
// app.post("/delete", function (req, res) {
//   const checkedItemId = req.body.checkbox;
 
//   Item.findByIdAndRemove(checkedItemId, function (err) {
//     if (!err) {
//       console.log("Successfully Deleted");
 
//       res.redirect("/");
//     }
//   });
// });
app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName; 
  if(listName === "Today"){
	  Item.findByIdAndRemove(checkedItemId, function(err){
		  if(!err){
			  console.log("Successfully deleted Checked Item");
			  res.redirect("/");
		  }
	  });
  }else{
	  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList)//where the items is the arry which was put into our document in DB
		  {
			  	 if(!err) {
		 res.redirect("/" +listName);
	 } 
 });
  }
});
// She deleted this get rout!
// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });
 
app.get("/about", function (req, res) {
  res.render("about");
});
 
 const port = process.env.PORT;
 if(port == null || port == ""){
	port = 3000; 
 }
app.listen(3000, function () {
  console.log("Server started on port 3000");
});