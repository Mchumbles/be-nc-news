const { selectArticleById } = require("../models/articles-models");
const {
  insertNewComment,
  removeCommentById,
} = require("../models/comments-models");

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

exports.deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;

  return removeCommentById(comment_id)
    .then((emptyObject) => {
      response.status(204).end();
    })
    .catch((error) => {
      next(error);
    });
};
