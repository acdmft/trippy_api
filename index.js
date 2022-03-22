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
const { Pool } = require("pg");
const Postgres = new Pool({ssl: {rejectUnauthorized: false}});

app.use(express.json());
// Only parse query parameters into strings, not objects
app.set('query parser', 'simple');

// USERS
const users = [];
// CREATE USER 
app.post("/premium", async (req, res) => {
  let result;
  try {
    const apiKey = uuidv4();
    result = await Postgres.query(
      "INSERT INTO users (name, api_key) VALUES ($1,$2) RETURNING api_key",
      [req.body.name, apiKey]
    )
  } catch(err) {
    return res.json({message: err});
  }
  
  res.json(result.rows);
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