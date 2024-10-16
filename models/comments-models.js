const db = require("../db/connection");

exports.selectArticleComments = (article_id) => {
  return db
    .query(
      `
    SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.insertNewComment = (newComment, article_id) => {
  const { username, body } = newComment;

  if (username === undefined || body === undefined) {
    return Promise.reject({
      status: 404,
      msg: "bad request: missing required fields",
    });
  }

  if (typeof body !== "string") {
    return Promise.reject({
      status: 400,
      msg: "bad request: wrong data type",
    });
  }

  const query = `
      INSERT INTO comments (article_id, author, body)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

  return db.query(query, [article_id, username, body]).then((result) => {
    return result.rows[0];
  });
};
