const express = require("express");
const {
  deleteCommentById,
  patchCommentById,
} = require("../controllers/comments-controllers");
const router = express.Router();

router.delete("/:comment_id", deleteCommentById);
router.patch("/:comment_id", patchCommentById);

module.exports = router;
