const db = require("../db/connection");

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBys = ["created_at", "votes", "title", "author", "topic"];

  if (!validSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by value" });
  }

  if (order !== "desc" && order !== "asc") {
    return Promise.reject({ status: 400, msg: "Invalid order value" });
  }
  let queryStr = `
  SELECT articles.author, 
         articles.title, 
         articles.article_id, 
         articles.topic, 
         articles.created_at, 
         articles.votes, 
         articles.article_img_url,
         CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
`;

  const queryParams = [];
  if (topic) {
    queryStr += `WHERE articles.topic = $1`;
    queryParams.push(topic);
  }
  queryStr += `
  GROUP BY articles.article_id
  ORDER BY ${sort_by} ${order}`;

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return result.rows[0];
    });
};

exports.updateArticleVotesById = (inc_votes, article_id) => {
  if (inc_votes === undefined) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  return db
    .query(
      `UPDATE articles
         SET votes = votes + $1
         WHERE article_id = $2
         RETURNING *;`,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return result.rows[0];
    });
};
