const express = require("express");
const { getTopics, postTopic } = require("../controllers/topics-controllers");
const router = express.Router();

router.get("/", getTopics);
router.post("/", postTopic);

module.exports = router;
