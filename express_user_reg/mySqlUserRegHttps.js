/*
    Node.js Express server to process a User Registration request
    or serve a static html file from subfolder public.

    Store user credentials in USERS table, DB PlayApp

    Sig Nin
    October 9, 2019
*/

// Use HTTPS - get credentials
const fs = require("fs");
const http = require("http");
const https = require("https");
const privateKey = fs.readFileSync("./sslcert/server.key");
const certificate = fs.readFileSync("./sslcert/server.crt");
const credentials = { key: privateKey, cert: certificate };

// Create DB connection
const mysql = require('mysql');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'tester',
  password : 'probador!Oct14!',
  database : 'playapp'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to DB playapp");
});

// Use Express app
const express = require("express");
const app = express();

// Use application/x-www-form-urlencoded parser to decode POST body
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Echo user registration data as json string
function respond_with_json_user_req(req, res, data, type) {
  // Prepare output in JSON format
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

// For User Registration page using POST
app.get('/user_reg', (req, res) => {
  res.sendFile(__dirname + "/https/" + "user_reg.html");
})

// Process a User Registration POST request
app.post('/process_user_reg', urlencodedParser, (req, res) => {
  const info = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userid: req.body.userid
  };
  let sql = 'INSERT INTO users SET ?';
  db.query(sql, info, (err, result) => {
    if (err) {
      console.log(`Error registering user: ${err}`);
      throw err;
    }
    console.log(result);
    respond_with_json_user_req(req, res, req.body, "User registered - POST");
  });
})

// To get an existing user's info
app.get('/user/:id', (req, res) => {
  const userid = req.params.id;
  console.log(`Getting info for user ${userid}`);
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [userid], (err, rows, fields) => {
    if (err) {
      console.log(`Error requesting user info: ${err}`);
      res.sendStatus(500);
      res.end();
      return;
    }
    console.log('Fetched info...');
    res.json(rows);
  });
});

// Run the server
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(8443, function() {
  console.log("Play App server listening on HTTPS port " + 8443);
});
