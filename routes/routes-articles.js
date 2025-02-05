const express = require("express");
const {
  getArticleById,
  getArticles,
  getArticleComments,
  patchArticleVotesById,
  postArticle,
  deleteArticleById,
} = require("../controllers/articles-controllers");
const { postArticleComment } = require("../controllers/comments-controllers");
const router = express.Router();

router.get("/", getArticles);
router.get("/:article_id", getArticleById);
router.get("/:article_id/comments", getArticleComments);
router.patch("/:article_id", patchArticleVotesById);
router.post("/:article_id/comments", postArticleComment);
router.post("/", postArticle);
router.delete("/:article_id", deleteArticleById);

module.exports = router;
