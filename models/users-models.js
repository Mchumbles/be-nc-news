const db = require("../db/connection");

exports.selectUsers = () => {
  return db.query("SELECT * FROM users").then((result) => {
    return result.rows;
  });
};

exports.selectUserByUsername = (username) => {
  return db
    .query(
      `
    SELECT * FROM users
    WHERE username = $1`,
      [username],
    )
    .then((user) => {
      return user.rows[0];
    });
};
