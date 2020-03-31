"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var urlencoded = require("urlencoded-parser");
var url = require("url");
var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const urlDataModel = new mongoose.model("urlMicroservice", {
  url: { type: String, required: true }
});

app.use(cors());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// URL shortner API
app.post("/api/shorturl/new", async (req, res) => {
  try {
    var result = url.parse(req.body.url);
    if (result.hostname === null) {
      res.json({ error: "Invalid URL" });
    } else {
      var newUrlData = new urlDataModel({ url: req.body.url });
      var result = await newUrlData.save();
      res.json({ original_url: result.url, short_url: result._id });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  try {
    var result = await urlDataModel.find({ _id: req.params.short_url }).exec();
    res.redirect(result[0].url);
  } catch (error) {
    res.json({ errpr: "Wrong Format" });
  }
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
