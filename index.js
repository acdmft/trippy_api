const express = require("express");
const app = express();
// ROUTERS 
const hotelsRoutes = require("./routes/hotelsRoutes");
const restaurantsRoutes = require("./routes/restaurantsRoutes");

app.use(express.json());
// Only parse query parameters into strings, not objects
app.set('query parser', 'simple');

// ROUTERS
app.use("/hotels", hotelsRoutes);
app.use("/restaurants", restaurantsRoutes);

app.use("*", (err, req, res, next) => {
  res.status(404).send("404 error");
})
app.listen(8001, () => console.log("Listent port 8001..."));