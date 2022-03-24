const mongoose = require("mongoose");

const restSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  address: {
    type: String,
    required: true,
    maxlength: 100,
  },
  city: {
    type: String,
    maxlength: 100,
    required: true,
  },
  country: {
    type: String,
    maxlength: 100,
  },
  stars: {
    type: Number
  },
  cuisine: {
    type: String,
    maxlength: 100,
  },
  priceCategory: {
    type: Number
  }
});
const Restaurant = mongoose.model("Restaurant", restSchema);
module.exports = Restaurant;