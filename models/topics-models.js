const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT slug, description FROM topics").then((result) => {
    if (result.rows.length < 1) {
      return Promise.reject({ status: 404, msg: "no topics available" });
    }
    return result.rows;
  });
};
