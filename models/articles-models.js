const db = require("../db/connection");

exports.selectArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  p = 1,
) => {
  const validSortBys = ["created_at", "votes", "title", "author", "topic"];

  if (!validSortBys.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort_by value" });
  }

  if (order !== "desc" && order !== "asc") {
    return Promise.reject({ status: 400, msg: "Invalid order value" });
  }

  const queryParams = [];
  const offset = (p - 1) * limit;

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

  if (topic) {
    queryStr += `WHERE articles.topic = $1 `;
    queryParams.push(topic);
  }

  queryStr += `
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}
    LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
  `;

  queryParams.push(limit, offset);

  const totalCountQuery = `
    SELECT COUNT(*) AS total_count FROM articles
    ${topic ? "WHERE topic = $1" : ""}
  `;

  const totalCountParams = topic ? [topic] : [];

  return Promise.all([
    db.query(queryStr, queryParams),
    db.query(totalCountQuery, totalCountParams),
  ]).then(([articleResult, totalCountResult]) => {
    return {
      articles: articleResult.rows,
      total_count: parseInt(totalCountResult.rows[0].total_count),
    };
  });
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count  
      FROM articles 
      LEFT JOIN comments ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id`,
      [article_id],
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
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
      [inc_votes, article_id],
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return result.rows[0];
    });
};

exports.insertNewArticle = (newPost) => {
  const { title, author, body, topic, article_img_url } = newPost;

  if (
    author === undefined ||
    body === undefined ||
    title === undefined ||
    topic === undefined
  ) {
    return Promise.reject({
      status: 400,
      msg: "bad request: missing required fields",
    });
  }

  if (
    typeof author !== "string" ||
    typeof body !== "string" ||
    typeof title !== "string" ||
    typeof topic !== "string"
  ) {
    return Promise.reject({
      status: 400,
      msg: "bad request: wrong data type",
    });
  }

  return db
    .query("SELECT * FROM topics WHERE slug = $1", [topic])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "topic not found",
        });
      }

      return db.query("SELECT * FROM users WHERE username = $1", [author]);
    })
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "user not found",
        });
      }
      const imageUrl =
        article_img_url ||
        "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700";

      const query = `
        INSERT INTO articles (author, body, title, topic, article_img_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;

      return db.query(query, [author, body, title, topic, imageUrl]);
    })
    .then((result) => {
      return result.rows[0];
    });
};
