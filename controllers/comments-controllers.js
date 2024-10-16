const { selectArticleById } = require("../models/articles-models");
const { insertNewComment } = require("../models/comments-models");

exports.postArticleComment = (request, response, next) => {
  const { article_id } = request.params;

  return insertNewComment(request.body, article_id)
    .then((newComment) => {
      response.status(201).send({ newComment: newComment });
    })
    .catch((error) => {
      next(error);
    });
};
