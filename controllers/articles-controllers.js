const {
  selectArticleById,
  selectArticles,
  updateArticleVotesById,
  insertNewArticle,
} = require("../models/articles-models");
const { selectArticleComments } = require("../models/comments-models");
const db = require("../db/connection");
const { request } = require("express");

exports.getArticles = (request, response, next) => {
  const {
    sort_by = "created_at",
    order = "desc",
    topic,
    limit = 10,
    p = 1,
  } = request.query;

  if (isNaN(limit) || isNaN(p) || limit < 1 || p < 1) {
    return next({ status: 400, msg: "Invalid pagination parameters" });
  }

  selectArticles(sort_by, order, topic, limit, p)
    .then(({ articles, total_count }) => {
      response.status(200).send({ articles, total_count });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  selectArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params;

  const promises = [selectArticleComments(article_id)];

  if (article_id) {
    promises.push(selectArticleById(article_id));
  }
  Promise.all(promises)
    .then((results) => {
      const comments = results[0];
      response.status(200).send({ comments: comments });
    })
    .catch((error) => {
      next(error);
    });
};

exports.patchArticleVotesById = (request, response, next) => {
  const { article_id } = request.params;
  const { inc_votes } = request.body;

  return updateArticleVotesById(inc_votes, article_id)
    .then((updatedArticle) => {
      response.status(200).send({ updatedArticle: updatedArticle });
    })
    .catch((error) => {
      next(error);
    });
};

exports.postArticle = (request, response, next) => {
  return insertNewArticle(request.body)
    .then((newPost) => {
      response.status(201).send({ newPost: newPost });
    })
    .catch((error) => {
      next(error);
    });
};
