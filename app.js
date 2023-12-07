require('dotenv').config();
require('./models/connection');

var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const fs = require('fs');
const WebSocket = require ('ws')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const storiesRouter = require('./routes/stories')


var app = express();
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

// Read your SSL certificate and key
// Load the .pfx file
const pfxPath = path.join(__dirname, 'certifs', 'certificat-fable-forge.pfx');
const pfxFile = fs.readFileSync(pfxPath);

// Extract the key and certificate from the .pfx file
const credentials = {
pfx: pfxFile,
passphrase: 'fable-forge', // Add passphrase if the .pfx file is encrypted
};

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

// Initialize WebSocket Server over HTTPS
const wss = new WebSocket.Server({ server: httpsServer });

// Your WebSocket API initialization function
const { initializeWebSocket } = require('./routes/api.js');
initializeWebSocket(wss);

// // Start the HTTPS server on port 443 (standard HTTPS port)
const PORT = process.env.PORT || 443; // Port 443 is the standard HTTPS port
httpsServer.listen(PORT, () => {
  console.log(`Secure WebSocket server running on port ${PORT}`);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/stories', storiesRouter)

module.exports = app;
