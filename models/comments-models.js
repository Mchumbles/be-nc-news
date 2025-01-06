const db = require("../db/connection");

exports.selectArticleComments = (article_id) => {
  return db
    .query(
      `
    SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC`,
      [article_id],
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

exports.removeCommentById = (comment_id) => {
  return db
    .query(
      `
        SELECT * FROM comments
        WHERE comment_id = $1;`,
      [comment_id],
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "comment does not exist" });
      }
    })
    .then(() => {
      return db
        .query(
          `
                  DELETE FROM comments
                  WHERE comment_id = $1;
                  `,
          [comment_id],
        )
        .then(() => {});
    });
};

exports.updateCommentVotesById = (comment_id, inc_votes) => {
  if (inc_votes === undefined) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(
      `UPDATE comments
       SET votes = votes + $1
       WHERE comment_id = $2
       RETURNING *;`,
      [inc_votes, comment_id],
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "comment does not exist" });
      }
      return result.rows[0];
    });
};
