const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

// init app
const app = express();

// use body-parser
app.use(bodyParser.json);
app.use(bodyParser.urlencoded({
    extended: true
}));


// listen server
app.listen(config.PORT, () => console.log(`Server listen port ${config.PORT}`));
