/*
    Node.js Express server to process a User Registration request
    or serve a static html file from subfolder public.

    Store user credentials in USERS table, DB PlayApp

    Sig Nin
    October 9, 2019
*/

var debug = true;

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
const app_https = express();

// Use application/x-www-form-urlencoded parser to decode POST body
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app_https.use(urlencodedParser);

// Use Morgan request logging
const morgan = require('morgan');
app.use(morgan('combined'));
app_https.use(morgan('combined'));

// Echo user registration data as json string
function respond_with_json_user_req(req, res, data, type) {
  // Prepare output in JSON format
  let response = {
    first_name : data.first_name,
    last_name  : data.last_name,
    userid     : data.userid
  }
  if (debug == true) {
    response.pw_1 = data.pw_1;
    response.pw_2 = data.pw_2;
  }
  console.log(response);
  res.end(type + " " + JSON.stringify(response));
}

/* ----------------------------------------------------------------------------
  HTTP processing - static public pages and user management forms
---------------------------------------------------------------------------- */

// For static html files in public folder
app.use(express.static('public'));

// User Registration and Change Password
app.get('/user_reg', (req, res) => {
  res.sendFile(__dirname + "/https/" + "user_reg.html");
});

app.get('/user_pw', (req, res) => {
  res.sendFile(__dirname + "/https/" + "user_pw.html");
});

/* ----------------------------------------------------------------------------
  HTTPS processing - login and user DB update
---------------------------------------------------------------------------- */

// Processing user passwords requires SHA-256
const crypto = require('crypto');

// Process a User Registration POST request
app_https.post('/process_user_reg', (req, res) => {
  const userid = req.body.userid;
  console.log(`User Registration requested for user ${userid}`);
  if (debug == true) {
    console.log(req.body);
  }
  if (req.body.pw_1 != req.body.pw_2) {
    console.log(`Password mismatch - ${req.body.pw_1} != ${req.body.pw_2}`);
    res.status(400);
    res.end('Passwords do not match.');
    return;
  }
  // check that the new password is not null
  if (req.body.pw_1 == '') {
    console.log('Empty password.');
    res.status(400);
    res.end(`New password invalid - empty password not allowed.`);
    return;
  }
  const pwhash = crypto.createHash('sha256').update(req.body.pw_1).digest('base64');
  const info = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    userid: req.body.userid,
    pwhash: pwhash
  };
  let sql = 'INSERT INTO users SET ?';
  db.query(sql, info, (err, result) => {
    if (err) {
      console.log(`Error registering user: ${err}`);
      res.status(500);
      res.end("Server error, could not register user.");
      return;
    }
    console.log(result);
    respond_with_json_user_req(req, res, req.body, "User registered - POST");
  });
});

// Process a User Password Update POST request
app_https.post('/process_user_pw', (req, res) => {
  const userid = req.body.userid;
  console.log(`Password Update requested for user ${userid}`);
  if (debug == true) {
    console.log(req.body);
  }
  // check that both versions of the new password are the same
  if (req.body.new_1 != req.body.new_2) {
    console.log('Password mismatch.');
    res.status(400);
    res.end(`New passwords do not match - ${req.body.new_1} != ${req.body.new_2}.`);
    return;
  }
  // check that the new password is not null
  if (req.body.new_1 == '') {
    console.log('Empty password.');
    res.status(400);
    res.end(`New password invalid - empty password not allowed.`);
    return;
  }
  // fetch the current password from the DB
  console.log(`Getting info for user ${userid}`);
  const sql_get = 'SELECT * FROM users WHERE userid = ?';
  let pwhash = null;
  db.query(sql_get, [userid], (err, rows, fields) => {
    if (err) {
      console.log(`Error requesting user info: ${err}`);
      res.status(500);
      res.end(`Server error, could not fetch info for userid: ${userid}`);
      return;
    }
    console.log(`Fetched info for user ${userid}`);
    console.log(rows);
    if (rows[0] == null) {
      console.log(`Could not find user ${userid}`);
      res.status(400);
      res.end(`Could not find userid: ${userid}`);
      return;
    }
    pwhash = rows[0].pwhash;
    // if a current password set, verify it matches what was provided
    console.log(`Hash of current password in DB: ${pwhash}`)
    if (pwhash != null) {
      console.log('Checking hash of given password against hash from DB')
      const hash = crypto.createHash('sha256').update(req.body.pw).digest('base64');
      console.log(`Hash of current password in update request: ${hash}`)
      if (hash != pwhash) {
        console.log('Current password given is incorrect.');
        res.status(400);
        res.end(`Incorrect password for userid: ${userid}`);
        return;
      }
    } else {
      console.log('No password set - will set new password.')
    }
    // update the password in the DB
    pwhash = crypto.createHash('sha256').update(req.body.new_1).digest('base64');
    let sql_update = `UPDATE users SET pwhash = '${pwhash}' WHERE userid = '${userid}'`;
    db.query(sql_update, (err, result) => {
      if (err) {
        console.log(`Error updating password for userid ${userid}: ${err}`);
        res.status(500);
        res.end("Server error, could not update password.");
        return;
      }
      console.log(result);
      res.status(200);
      res.end(`Password updated for userid ${userid}`);
    });
  });
});

// To get an existing user's info
app_https.get('/user/:id', (req, res) => {
  const userid = req.params.id;
  console.log(`Getting info for user with id = ${userid}`);
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [userid], (err, rows, fields) => {
    if (err) {
      console.log(`Error requesting user info: ${err}`);
      res.status(500);
      res.end();
      return;
    }
    console.log('Fetched info...');
    res.status(200);
    res.json(rows);
  });
});

// Run the servers
const httpServer = http.createServer(credentials, app);
httpServer.listen(8081, function() {
  console.log("Play App server listening on HTTP port " + 8081);
});
const httpsServer = https.createServer(credentials, app_https);
httpsServer.listen(8443, function() {
  console.log("Play App server listening on HTTPS port " + 8443);
});
