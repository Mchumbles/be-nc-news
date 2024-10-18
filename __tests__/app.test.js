const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const endpoints = require("../endpoints.json");
require("jest-extended");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api/topics", () => {
  test("GET: 200 - an array of topic objects, each of which should have the properties 'slug' and 'description'", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((topics) => {
        topics.body.topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
  test("GET: 404 - responds with a custom error when a search is attempted for all topics but that endpoint has no data'", () => {
    return db.query("DELETE FROM comments").then(() => {
      return db.query("DELETE FROM articles").then(() => {
        return db.query("DELETE FROM topics").then(() => {
          return request(app)
            .get("/api/topics")
            .expect(404)
            .then((response) => {
              expect(response.body.msg).toBe("no topics available");
            });
        });
      });
    });
  });
});

describe("/api", () => {
  test("GET: 200 - responds with an object detailing all availble endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("/api/articles", () => {
  describe("/api/articles/:article_id", () => {
    test("GET: 200 - responds with a specific article by searching its artticle_id", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          expect(typeof body.article.author).toBe("string");
          expect(typeof body.article.title).toBe("string");
          expect(typeof body.article.article_id).toBe("number");
          expect(typeof body.article.body).toBe("string");
          expect(typeof body.article.topic).toBe("string");
          expect(typeof body.article.created_at).toBe("string");
          expect(typeof body.article.votes).toBe("number");
          expect(typeof body.article.article_img_url).toBe("string");
        });
    });
    test("GET: 404 - responds with a custom error when a search is attempted for an article_id that does not exist", () => {
      return request(app)
        .get("/api/articles/9000")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("article does not exist");
        });
    });
    test("GET: 400 - responds with an error when a search is attempted with an invalid id", () => {
      return request(app)
        .get("/api/articles/not-an-id")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("bad request");
        });
    });
  });
  describe("/api/articles", () => {
    test("GET: 200 - responds with an articles array of article objects, sorted by created_at DESC", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(Array.isArray(articles)).toBe(true);
          articles.forEach((article) => {
            expect(typeof article.author).toBe("string");
            expect(typeof article.title).toBe("string");
            expect(typeof article.article_id).toBe("number");
            expect(typeof article.topic).toBe("string");
            expect(typeof article.created_at).toBe("string");
            expect(typeof article.votes).toBe("number");
            expect(typeof article.article_img_url).toBe("string");
            expect(typeof article.comment_count).toBe("number");
          });
          expect(articles).toBeSorted("created_at");
        });
    });
    test("GET: 200 - take a sort-by query and respond with articles sorted by a given coloumn name that isnt the default", () => {
      return request(app)
        .get("/api/articles?srot_by=votes")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles).toBeSorted("votes");
        });
    });
    test("GET: 400 - returns an error when given a non-valid sort_by", () => {
      return request(app)
        .get("/api/articles?sort_by=nonense")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort_by value");
        });
    });
  });
  describe("/api/articles/:article_id/comments", () => {
    test("GET: 200 - responds with an array of comments joined with the requested article_id, sorted by created_at, decending", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then((response) => {
          const comments = response.body.comments;
          expect(comments.length).toEqual(11);
          comments.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
            expect(typeof comment.author).toBe("string");
            expect(typeof comment.body).toBe("string");
            expect(typeof comment.article_id).toBe("number");
          });
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET: 404 - returns an error when given a article_id that doesn't exist", () => {
      return request(app)
        .get("/api/articles/9999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("article does not exist");
        });
    });
    test("GET: 400 - responds with an error when a search is attempted with an invalid id", () => {
      return request(app)
        .get("/api/articles/not-an-id/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("bad request");
        });
    });
    test("GET: 200 - responds with an empty array when passed an article_id that is present in the database, but has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.comments)).toBe(true);
          expect(body.comments).toHaveLength(0);
        });
    });
  });
});
