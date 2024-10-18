const db = require("../db/connection");

exports.selectUsers = () => {
  return db.query("SELECT * FROM users").then((result) => {
    if (result.rows.length < 1) {
      return Promise.reject({ status: 404, msg: "no users available" });
    }
    return result.rows;
  });
};
