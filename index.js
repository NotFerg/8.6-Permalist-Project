import express from "express";
import pg from "pg";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "root",
  port: 5432,
});

db.connect();

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${day}/${month}/${year}`;

async function getItems() {
  const result = await db.query("SELECT * FROM items");
  let items = [];
  result.rows.forEach((item) => {
    items.push(item);
  });
  console.log(items);
  return items;
}

app.get("/", async (req, res) => {
  let items = await getItems();
  res.render("index.ejs", {
    listTitle: currentDate,
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  if (item === "") {
    res.redirect("/");
  }
  try {
    let result = await db.query("INSERT INTO items (title) VALUES ($1)", [item]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const item = req.body.updatedItemTitle;
  if (item === "") {
    res.redirect("/");
  }
  try{
    let result = await db.query("UPDATE items SET title = $1 WHERE id = $2", [item,id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try{
    let result = await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/")
  }catch(error){
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
