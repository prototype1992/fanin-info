const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const mongoose = require('mongoose');

// config app
const config = require('./config');

// init app
const app = express();

// use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// static files
app.use(express.static(path.join(__dirname, 'client')));

// routes
const placeRouter = require('./routes/places');
app.use('/api/places', placeRouter);

// connect db
mongoose.connect(config.MONGO_SERVER)
    .then(() => {
        console.log('DB connect');
    })
    .catch(() => {
        console.log('Db connect error');
    });

// запуск сервера
app.listen(config.PORT, () => {
    console.log(`Server has been started on port ${config.PORT}`);
});
