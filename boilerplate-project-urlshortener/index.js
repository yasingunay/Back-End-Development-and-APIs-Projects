require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { URL } = require('url');
const shortid = require('shortid');
const dns = require('dns');
const urlparser = require('url');
// 

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Helper function to validate URL
function isValidURL(url) {
  if (url) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (error) {
      return false;
    }
  }
  return false; // Return false if the URL is empty or undefined.
}


const urlNumbers ={}
let urlCounter = 1; // Initialize the URL counter.


// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  const original_url = req.body.url;

  if (!isValidURL(original_url)) {
    res.json({ error: 'invalid url' });
    return;
  }

  const dnslookup = dns.lookup(urlparser.parse(original_url).hostname, async (err, address) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      const shortUrl = urlCounter++;
      urlNumbers[shortUrl] = original_url;
      res.json({ original_url: original_url, short_url: shortUrl });
    }
  });
});


// Define a route to handle redirection to the original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urlNumbers[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'short url not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
