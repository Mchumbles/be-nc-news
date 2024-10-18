const { selectUsers, selectUserByUsername } = require("../models/users-models");
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

exports.getUserByUsername = (request, response, next) => {
  const { username } = request.params;
  selectUserByUsername(username)
    .then((user) => {
      if (user === undefined) {
        response.status(200).send({ msg: "user not found" });
      }
      response.status(200).send({ user });
    })
    .catch((error) => {
      next(error);
    });
};
