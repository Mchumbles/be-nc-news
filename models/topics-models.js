const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT slug, description FROM topics").then((result) => {
    if (result.rows.length < 1) {
      return Promise.reject({ status: 404, msg: "no topics available" });
    }
    return result.rows;
  });
};

exports.insertNewTopic = (newTopic) => {
  const { slug, description } = newTopic;

  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: "Bad request: missing required fields",
    });
  }

  if (typeof slug !== "string" || typeof description !== "string") {
    return Promise.reject({
      status: 400,
      msg: "Bad request: wrong data type",
    });
  }

  const query = `
    INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *;
  `;

  return db
    .query(query, [slug, description])
    .then((result) => result.rows[0])
    .catch((error) => {
      if (error.code === "23505") {
        return Promise.reject({
          status: 400,
          msg: "Topic slug already exists",
        });
      }
      return Promise.reject({ status: 500, msg: "Internal server error" });
    });
};
