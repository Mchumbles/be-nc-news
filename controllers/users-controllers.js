const { selectUsers } = require("../models/users-models");
const db = require("../db/connection");
const { request } = require("express");

exports.getUsers = (request, response, next) => {
  selectUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((error) => {
      next(error);
    });
};
