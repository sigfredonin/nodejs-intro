var express = require("express");
var app = express();

app.get('/', function (req, res) {
  res.send("Hello World!");
})

var server = app.listen(8081, function () {
  let host = server.address().address;
  console.log("host = " + host);
  let port = server.address().port;
  console.log("port = " + port);
  console.log("Sample Express Hello World listening at http://%s:%s", host, port);
})
