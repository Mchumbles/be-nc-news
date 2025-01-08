const { selectTopics, insertNewTopic } = require("../models/topics-models");
const db = require("../db/connection");

exports.getTopics = (request, response, next) => {
  selectTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((error) => {
      next(error);
    });
};

exports.postTopic = (request, response, next) => {
  const newTopic = request.body;

  insertNewTopic(newTopic)
    .then((topic) => {
      response.status(201).send({ topic });
    })
    .catch((error) => {
      next(error);
    });
};
