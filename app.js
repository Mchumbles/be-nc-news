const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers");
const endpoints = require("./endpoints.json");

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

//ERRORS ***************************************************************

app.use((error, request, response, next) => {
  response.status(500).send({ msg: "500 server error" });
});

module.exports = app;
