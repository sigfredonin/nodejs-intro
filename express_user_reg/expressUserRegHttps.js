/*
    Node.js Express server to process a User Registration request
    or serve a static html file from subfolder public.

    Sig Nin
    October 9, 2019
*/

// Use HTTPS - get credentials
var fs = require("fs");
var http = require("http");
var https = require("https");
var privateKey = fs.readFileSync("./sslcert/server.key");
var certificate = fs.readFileSync("./sslcert/server.crt");
var credentials = { key: privateKey, cert: certificate };

// Use Express app
var express = require("express");
var app = express();

// Use application/x-www-form-urlencoded parser to decode POST body
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });

function respond_with_json_user_req(req, res, type) {
  // Prepare output in JSON format
  let data = null;
  if (type == "GET") {
    data = req.query;
  } else if (type == "POST") {
    data = req.body;
  }
  let response = {
    first_name: data.first_name,
    last_name:  data.last_name,
    userid:     data.userid,
    PW_1:       data.pw_1,
    PW_2:       data.pw_2
  }
  console.log(response);
  res.end(type + " " + JSON.stringify(response));
}

// For static html files in public folder
app.use(express.static('public'));

// For User Registration page using GET
app.get('/user_reg_get', function (req, res) {
  res.sendFile(__dirname + "/https/" + "user_reg_get.html");
})

// For User Registration page using POST
app.get('/user_reg_post', function (req, res) {
  res.sendFile(__dirname + "/https/" + "user_reg_post.html");
})

// Process a GET request
app.get('/process_get', function (req, res) {
  respond_with_json_user_req(req, res, "GET");
})

// Process a POST request
app.post('/process_post', urlencodedParser, function (req, res) {
  respond_with_json_user_req(req, res, "POST");
})

// Run the server
var httpsServer = https.createServer(credentials, app).listen(8443);
