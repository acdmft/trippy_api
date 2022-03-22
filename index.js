const express = require("express");
const app = express();
// UUID 
const { v4: uuidv4 } = require('uuid');
// ROUTERS 
const hotelsRoutes = require("./routes/hotelsRoutes");
const restaurantsRoutes = require("./routes/restaurantsRoutes");
const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env"
});

app.use(express.json());
// Only parse query parameters into strings, not objects
app.set('query parser', 'simple');

// USERS
const users = [];
// CREATE USER 
app.post("/premium", (req, res) => {
  console.log('post req /premium');
  const apiKey = uuidv4();
  users.push({username: req.body.username, key: apiKey});
  res.json(apiKey);
});
// GET USER 
app.get("/api-key", (req, res) => {
    const user = users.find((user) => {
      return user.name.toLowerCase() === req.query["username"];
    });
    // console.log(user)
    // if (!user) {
    //   return res.json("user not found");
    // }
    res.json(user.key);
});

// ROUTERS
app.use("/hotels", hotelsRoutes);
app.use("/restaurants", restaurantsRoutes);


app.use("*", (err, req, res, next) => {
  res.status(404).send("404 error");
});
app.listen(8001, () => console.log("Listent port 8001..."));