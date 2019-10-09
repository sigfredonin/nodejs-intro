var express = require("express");
var app = express();

app.use(express.static('public'));

app.get('/user_reg', function (req, res) {
  res.sendFile(__dirname + "/" + "user_reg.html");
})

app.get('/process_get', function (req, res) {
  // Prepare output in JSON format
  let response = {
    first_name: req.query.first_name,
    last_name:  req.query.last_name,
    userid:     req.query.userid,
    PW_1:       req.query.pw_1,
    PW_2:       req.query.pw_2
  }
  console.log(response);
  res.end(JSON.stringify(response));
})

var server = app.listen(8081, function () {
  let host = server.address().address;
  console.log("host = " + host);
  let port = server.address().port;
  console.log("port = " + port);
  console.log("Sample Express User Registration Form listening at http://%s:%s", host, port);
})
