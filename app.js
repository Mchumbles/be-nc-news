const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controllers");
const {
  getArticleById,
  getArticles,
  getArticleComments,
  patchArticleVotesById,
} = require("./controllers/articles-controllers");
const {
  postArticleComment,
  deleteCommentById,
} = require("./controllers/comments-controllers");
const { getUsers } = require("./controllers/users-controllers");
const endpoints = require("./endpoints.json");

app.use(express.json());

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints: endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getArticleComments);

app.get("/api/users", getUsers);

app.post("/api/articles/:article_id/comments", postArticleComment);

app.patch("/api/articles/:article_id", patchArticleVotesById);

app.delete("/api/comments/:comment_id", deleteCommentById);

//ERRORS ***************************************************************

app.use((err, request, response, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "bad request" });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.code === "23503" && err.detail.includes("article_id")) {
    response.status(404).send({ msg: "article does not exist" });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.code === "23503" && err.detail.includes("author")) {
    response.status(404).send({ msg: "username not found" });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.code === "23502") {
    response.status(404).send({ msg: "bad request: missing required fields" });
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
