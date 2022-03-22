const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const dotenv = require("dotenv");
dotenv.config({
  path: "../config.env"
});
const { Pool } = require("pg");
const Postgres = new Pool({ssl: {rejectUnauthorized: false}});


// restaurants
const restaurants = [
  {
    id: 1,
    name: "Les trois Mousquetaires",
    address: "22 av des Champs-Élysées",
    city: "Paris",
    country: "France",
    stars: 4,
    cuisine: "french",
    priceCategory: 3,
  },
  {
    id: 2,
    name: "The Fat Guy",
    address: "47 Jackson Boulevard",
    city: "New York",
    country: "US",
    stars: 5,
    cuisine: "burger",
    priceCategory: 1,
  },
  {
    id: 3,
    name: "Veggies",
    address: "77 Avenir Street",
    city: "Sydney",
    country: "Australia",
    stars: 5,
    cuisine: "vegan",
    priceCategory: 2,
  },
  {
    id: 4,
    name: "McDonalds",
    address: "22 av",
    city: "Chicago",
    country: "US",
    stars: 4,
    cuisine: "french",
    priceCategory: 3,
  },
];
// JOI VALIDATION SCHEMA
const restaurantSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().alphanum().required(),
  country: Joi.string().alphanum().required(),
  stars: Joi.number().integer().min(1).max(5).required(),
  cuisine: Joi.string().alphanum().required(),
  priceCategory: Joi.number().integer().min(1).max(3).required(),
});
// MIDDLEWARES
// RESTAURANT VALIDATION MIDDLEWARE
function validRestaurant(req, res, next) {
  const validation = restaurantSchema.validate(req.body);
  if (validation.error) {
    return res.status(400).json({
      message: "Bad request (400)",
      description: validation.error.details[0].message,
    });
  }
  next();
}
// SET LIMIT OF REQUESTS PER MINUTE
let time = 0;
let numOfRequests = 0;
setInterval(() => {
  if (time < 60) {
    time++;
  } else {
    time = 0;
    numOfRequests = 0;
  }
}, 1000);

function limitNumOfRequests(_req, res, next) {
  if (numOfRequests > 100) {
    console.log(time);
    return res.status(429).json({ message: "Too many requests for minute!" });
  }
  numOfRequests++;
  next();
}
// ADVANCED ROUTES (WITH QUERY PARAMETERS)
router.get("/", async (req, res) => {
  const queryKeys = Object.keys(req.query);
  let result = await Postgres.query(
    "SELECT * FROM restaurants"
  );
  result = result.rows;
  let restaurants = result.rows;
  if (queryKeys.length === 0) {
    return res.json(result);
  }
  let allowedParams = ["city", "country", "stars", "cuisine", "pricecategory"];
  for (let i=0; i < queryKeys.length;i++) {
    if (allowedParams.includes(queryKeys[i])) {
      result = result.filter((rest) => {
        return rest[queryKeys[i]].toString().toLowerCase() === req.query[queryKeys[i]].toLowerCase();
      })
    }
  }
  if (result.length === 0) {
    res.json({message: "No restaurants mathcing parameters"})
  }
  res.json(result);
});
// ADVANCED ROUTES (WITH QUERY PARAMETERS)
// router.get("/", limitNumOfRequests, (req, res) => {
//   const queryKeys = Object.keys(req.query);
//   if (queryKeys.length === 0) {
//     // if no query params provided send all restaurants
//     return res.json(restaurants);
//   }
//   let result = restaurants;
//   let allowedParams = ["city", "country", "stars", "cuisine", "priceCategory"];
//   for (let i = 0; i < queryKeys.length; i++) {
//     // better to use Joi or other library to validate params
//     if (allowedParams.includes(queryKeys[i])) {
//       result = result.filter((rest) => {
//         return rest[queryKeys[i]].toString().toLowerCase() === req.query[queryKeys[i]].toLowerCase();
//       });
//     }
//   }

//   if (result.length > 0) {
//     return res.json(result);
//   } else {
//     return res.json({ message: "No restaurants matching parameters" });
//   }
// });

// ROUTES

// GET RESTAURANT BY ID
router.get("/:id", limitNumOfRequests, async (req, res) => {
  let restaurant;
  try {
    restaurant = await Postgres.query(
      "SELECT * FROM restaurants WHERE id=$1",
      [req.params.id]
    );
  } catch(err) {
    return res.json({message: err});
  }
  if (restaurant.rows.length === 0) {
    res.json({message: `restaurant with id: ${req.params.id}`});
  }
  res.json(restaurant.rows);
});
// POST A RESTAURANT
router.post("/", limitNumOfRequests, validRestaurant, (req, res) => {
  const restaurant = req.body;
  restaurant.id = restaurants.length + 1;
  restaurants.push(restaurant);
  res.json({ message: "Restaurant added", restaurants });
});
// PATCH A RESTAURANT
router.patch("/:id", limitNumOfRequests, (req, res) => {
  const restaurant = restaurants.find((restaurant) => {
    return restaurant.id.toString() === req.params.id;
  });
  if (!restaurant) {
    return res.send(`Restaurant with id: ${req.params.id} no found`);
  }
  restaurant.name = req.body.name;
  res.json({
    message: "Updated restaurant with id: " + req.params.id,
    restaurant,
  });
});
// DELETE A RESTAURANT
router.delete("/:id", limitNumOfRequests, (req, res) => {
  const restaurant = restaurants.find((restaurant) => {
    return restaurant.id.toString() === req.params.id;
  });
  if (!restaurant) {
    return res.send(`Restaurant with id: ${req.params.id} not found`);
  }
  const index = restaurants.indexOf(restaurant);
  restaurants.splice(index, 1);

  res.json({
    message: `The restaurant with id ${req.params.id} was removed`,
    restaurants,
  });
});

module.exports = router;
