const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");

// HOTELS
const hotels = [
  {
    id: 1,
    name: "Imperial Hotel",
    address: "84 av des Champs-Élysées",
    city: "Paris",
    country: "France",
    stars: 5,
    hasSpa: true,
    hasPool: true,
    priceCategory: 3,
  },
  {
    id: 2,
    name: "The Queen",
    address: "3 Darwin Street",
    city: "London",
    country: "England",
    stars: 4,
    hasSpa: true,
    hasPool: false,
    priceCategory: 3,
  },
  {
    id: 3,
    name: "Kiwi land",
    address: "4587 George St.",
    city: "Auckland",
    country: "New-Zealand",
    stars: 3,
    hasSpa: false,
    hasPool: true,
    priceCategory: 2,
  },
  {
    id: 4,
    name: "Tower",
    address: "4587 George St.",
    city: "Auckland",
    country: "France",
    stars: 3,
    hasSpa: false,
    hasPool: true,
    priceCategory: 2,
  },
];
// JOI VALIDATION SCHEMA
const hotelSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().alphanum().required(),
  country: Joi.string().alphanum().required(),
  stars: Joi.number().integer().min(1).max(5).required(),
  hasSpa: Joi.boolean(),
  hasPool: Joi.boolean(),
  priceCategory: Joi.number().integer().min(1).max(3).required(),
});
// MIDDLEWARES
// HOTEL VALIDATION MIDDLEWARE
function validHotel(req, res, next) {
  const validation = hotelSchema.validate(req.body);
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
  if (numOfRequests > 10) {
    console.log(time);
    return res.status(429).json({ message: "Too many requests for minute!" });
  }
  numOfRequests++;
  next();
}

// ADVANCED ROUTES (WITH QUERY PARAMETERS)
router.get("/", limitNumOfRequests, (req, res) => {
  const queryKeys = Object.keys(req.query);
  if (queryKeys.length > 0) {
    let result = hotels;
    let allowedParams = [
      "city",
      "country",
      "stars",
      "cuisine",
      "priceCategory",
      "hasSpa",
      "hasPool",
    ];
    for (let i = 0; i < queryKeys.length; i++) {
      if (allowedParams.includes(queryKeys[i])) {
        // iterate hotels
        for (let j = 0; j < hotels.length; j++) {
          let param = req.query[queryKeys[i]];
          let hotelVal = hotels[j][queryKeys[i]];
          // if param doesn't match to any hotel exclude this restaurant from final array
          if (hotelVal.toString().toLowerCase() !== param) {
            // remove all hotels with the same param value
            result = result.filter((hotel) => {
              return hotel[queryKeys[i]] !== hotelVal;
            });
          }
        }
      }
    }
    if (result.length > 0) {
      return res.json(result);
    } else {
      return res.json({ message: "No restaurants matching parameters" });
    }
  }
  // if no query params provided send all hotels
  res.json(hotels);
});
// ROUTES

// GET HOTEL BY ID
router.get("/:id", limitNumOfRequests, (req, res) => {
  const hotel = hotels.find((hotel) => {
    return hotel.id.toString() === req.params.id;
  });
  if (!hotel) {
    return res.send(`Hotel with id: ${req.params.id} not found`);
  }
  res.json(hotel);
});
// POST AN HOTEL
router.post("/", limitNumOfRequests, validHotel, (req, res) => {
  const hotel = req.body;
  hotel.id = hotels.length + 1;
  hotels.push(hotel);
  res.json({ message: "Hotel added", hotel });
});
// PATCH A HOTEL
router.patch("/:id", (req, res) => {
  const hotel = hotels.find((hotel) => {
    return hotel.id.toString() === req.params.id;
  });
  if (!hotel) {
    return res.send(`Hotel with id: ${req.params.id} no found`);
  }
  hotel.name = req.body.name;
  res.json({
    message: "Updated hotel with id: " + req.params.id,
    hotel,
  });
});
// DELETE AN HOTEL
router.delete("/:id", limitNumOfRequests, (req, res) => {
  const hotel = hotels.find((hotel) => {
    return hotel.id.toString() === req.params.id;
  });
  if (!hotel) {
    return res.send(`Hotel with id: ${req.params.id} not found`);
  }
  const index = hotels.indexOf(hotel);
  hotels.splice(index, 1);

  res.json({
    message: `The hotel with id ${req.params.id} was removed`,
    hotels,
  });
});
module.exports = router;
