// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your API endpoint for parsing dates
app.get('/api/:date?', (req, res) => {
  const dateString = req.params.date;

  // Try to parse the date
  const parsedDate = dateString ? new Date(dateString) : new Date();

  // Check if the parsed date is valid
  const isValidDate = !isNaN(parsedDate.getTime());

  if (isValidDate) {
    const unix = parsedDate.getTime();
    const utc = parsedDate.toUTCString();
    res.json({ unix, utc });
  } else {
    // If the date is invalid, check if it's a Unix timestamp
    const timestamp = parseInt(dateString);
    const isUnixTimestamp = !isNaN(timestamp);

    if (isUnixTimestamp) {
      const dateFromTimestamp = new Date(timestamp);
      const unix = dateFromTimestamp.getTime();
      const utc = dateFromTimestamp.toUTCString();
      res.json({ unix, utc });
    } else {
      res.json({ error: "Invalid Date" });
    }
  }
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
