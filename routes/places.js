const express = require('express');
const Router = express.Router();
const Places = require('../models/places');

// получение меток get запрос http://localhost:9001/api/places (GET)
Router.get('/', async (req, res) => {
    console.clear();
    console.log('/api/places');
    const places = await Places.find({});

    res.status(200).json(places);
});

// добавление меток post запрос http://localhost:9001/api/places (POST)
Router.post('/', async (req, res) => {
    console.log('req body', req.body);
    const place = new Places({
        coordinates: req.body.coordinates,
        address: req.body.address,
        date: Date.now(),
        photos: {
            url: req.body.photoUrl
        },
        reviews: {
            place: req.body.reviewPlace,
            comment: req.body.reviewComment
        }
    });

    await place.save();

    res.status(201).json(place);
});

module.exports = Router;
