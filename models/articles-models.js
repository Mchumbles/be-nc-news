const db = require("../db/connection");

exports.selectArticles = (sort_by = "created_at") => {
  const ValidSortBys = ["created_at", "votes"];

  if (!ValidSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by value" });
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
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;
`;
  return db.query(queryStr).then(({ rows }) => {
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
