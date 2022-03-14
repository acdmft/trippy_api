const express = require("express");
const router = express.Router(); 
const Joi = require("@hapi/joi");

// HOTELS 
const hotels = 
[
	{
		"id": 1,
		"name": "Imperial Hotel",
		"address": "84 av des Champs-Élysées",
		"city": "Paris",
		"country": "France",
		"stars": 5,
		"hasSpa": true,
		"hasPool": true,
		"priceCategory": 3
	},
	{
		"id": 2,
		"name": "The Queen",
		"address": "3 Darwin Street",
		"city": "London",
		"country": "England",
		"stars": 4,
		"hasSpa": true,
		"hasPool": false,
		"priceCategory": 3
	},
	{
		"id": 3,
		"name": "Kiwi land",
		"address": "4587 George St.",
		"city": "Auckland",
		"country": "New-Zealand",
		"stars": 3,
		"hasSpa": false,
		"hasPool": true,
		"priceCategory": 2
	}
]
// JOI VALIDATION SCHEMA 
const hotelSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  city: Joi.string().alphanum().required(),
  country: Joi.string().alphanum().required(),
  stars: Joi.number().integer(),
  hasSpa: Joi.boolean(),
  hasPool: Joi.boolean(),
  priceCategory: Joi.number().integer().min(1).max(3).required()
})
function validHotel(req, res, next) {
  const validation = hotelSchema.validate(req.body);
  if (validation.error) {
    return res.status(400).json({
      message: "Bad request (400)",
      description: validation.error.details[0].message,
    });
  }
}
// GET ALL HOTELS 
router.get("/", (_req, res) => {
  res.json(hotels);
})
// GET HOTEL BY ID 
router.get("/id/:id", (req, res) => {
  const hotel = hotels.find((hotel) => {
    return hotel.id.toString() === req.params.id; 
  })
  if (!hotel) {
    return res.send(`Hotel with id: ${req.params.id} not found`);
  }
  res.json(hotel);
})
// POST AN HOTEL 
router.post("/", validHotel, (req,res) => {
  const hotel = req.body;
  hotel.id = hotels.length +1;
  hotels.push(hotel);
  res.status(201).json({message: "Hotel added", hotel})
});

module.exports = router;