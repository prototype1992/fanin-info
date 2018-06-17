const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// создаем схему для меток
const placeSchema = new Schema({
    coordinates: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    photos: [
        {
            url: {
                type: String
            }
        }
    ],
    reviews: [
        {
            place: {
                type: String,
                required: true
            },
            date: {
                type: Date,
                default: Date.now()
            },
            comment: {
                type: String,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('places', placeSchema);
