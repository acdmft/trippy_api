const express = require("express");
const app = express();
// ROUTES 
const hotelsRoutes = require("./routes/hotelsRoutes");

app.use(express.json());

app.use("/hotels", hotelsRoutes);

app.use("*", (err, req, res, next) => {
  res.status(404).send("404 error");
})
app.listen(8001, () => console.log("Listent port 8001..."));