const express = require("express");
const app = express();
const endpoints = require("./endpoints.json");

const topicsRouter = require("./routes/routes-topics");
const articlesRouter = require("./routes/routes-articles");
const commentsRouter = require("./routes/routes-comments");
const usersRouter = require("./routes/routes-users");

app.use(express.json());

const cors = require("cors");

app.use(cors());

app.get("/api", (request, response) => {
  response.status(200).send({ endpoints: endpoints });
});

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

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
