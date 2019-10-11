/*
    Node.js Express server to process a User Registration request
    or serve a static html file from subfolder public.

    Sig Nin
    October 9, 2019
*/
var express = require("express");
var app = express();

// Create application/x-www-form-urlencoded parser
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
  res.sendFile(__dirname + "/http/" + "user_reg_get.html");
})

// For User Registration page using POST
app.get('/user_reg_post', function (req, res) {
  res.sendFile(__dirname + "/http/" + "user_reg_post.html");
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
var server = app.listen(8081, function () {
  let host = server.address().address;
  console.log("host = " + host);
  let port = server.address().port;
  console.log("port = " + port);
  console.log("Sample Express User Registration Form listening at http://%s:%s", host, port);
})
