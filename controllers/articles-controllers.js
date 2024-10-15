const {
  selectArticleById,
  selectArticles,
} = require("../models/articles-models");
const db = require("../db/connection");
const { request } = require("express");

exports.getArticles = (request, response, next) => {
  const { sort_by } = request.query;
  selectArticles(sort_by)
    .then((articles) => {
      response.status(200).send({ articles });
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
