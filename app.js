const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers");
const { getArticleById } = require("./controllers/articles-controllers");
const endpoints = require("./endpoints.json");

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

//ERRORS ***************************************************************

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "bad request" });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((error, request, response, next) => {
  response.status(500).send({ msg: "500 server error" });
});

module.exports = app;
