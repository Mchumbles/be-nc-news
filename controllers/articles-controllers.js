const {
  selectArticleById,
  selectArticles,
  updateArticleVotesById,
  insertNewArticle,
} = require("../models/articles-models");
const {
  selectArticleComments,
  selectTotalComments,
} = require("../models/comments-models");
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
    .catch(next);
};

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;

  selectArticleById(article_id)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticleComments = (request, response, next) => {
  const { article_id } = request.params;
  const { limit = 10, p = 1 } = request.query;

  if (isNaN(limit) || isNaN(p) || limit < 1 || p < 1) {
    return next({ status: 400, msg: "Invalid pagination parameters" });
  }

  const offset = (p - 1) * limit;

  Promise.all([
    selectArticleComments(article_id, limit, offset),
    selectArticleById(article_id),
  ])
    .then(([comments, article]) => {
      if (!article) {
        return next({ status: 404, msg: "article not found" });
      }

      if (comments.length === 0) {
        return response.status(200).send({ comments: [], total_count: 0 });
      }

      return selectTotalComments(article_id).then((totalCount) => {
        response.status(200).send({ comments, total_count: totalCount });
      });
    })
    .catch(next);
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
