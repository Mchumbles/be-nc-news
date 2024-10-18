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
          expect(body.article).toEqual({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            comment_count: 11,
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
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
    test("GET: 200 - returns an article via the article_id, which should now also include comments", () => {
      return request(app)
        .get("/api/articles/6")
        .expect(200)
        .then(({ body }) => {
          const article = body.article;
          expect(article).toMatchObject({
            article_id: 6,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            author: "icellusedkars",
            body: "Delicious tin of cat food",
            comment_count: 1,
            created_at: "2020-10-18T01:00:00.000Z",
            title: "A",
            topic: "mitch",
            votes: 0,
          });
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
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
    describe("/api/articles (sorting and order queries)", () => {
      test("GET: 200 - take a sort-by query and respond with articles sorted by a given coloumn name that isnt the default", () => {
        return request(app)
          .get("/api/articles?sort_by=title")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toBeSortedBy("title", { descending: true });
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
      test("GET: 200 - take a query that returns articles in ascending with the default sort_by 'created_at' and a specified sort_by", () => {
        return request(app)
          .get("/api/articles?order=asc")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toBeSortedBy("created_at");
          })
          .then(() => {
            return request(app)
              .get("/api/articles?sort_by=votes&order=asc")
              .expect(200)
              .then(({ body }) => {
                expect(body.articles).toBeSortedBy("votes");
              });
          });
      });
      test("GET: 200 - take a query that returns articles in descending order when specified in the query", () => {
        return request(app)
          .get("/api/articles?order=desc")
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toBeSortedBy("created_at", {
              descending: true,
            });
          });
      });
      test("GET: 400 - returns an error when query is invalid", () => {
        return request(app)
          .get("/api/articles?order=invalid")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("Invalid order value");
          });
      });
    });
    describe("/api/articles (topic queries", () => {
      test("GET: 200 - take the topic query that returns articles filtered by the topic", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(({ body }) => {
            body.articles.forEach((article) => {
              expect(article.topic).toEqual("mitch");
            });
          });
      });
    });
    test("GET: 204 - returns an empty array when topic does not exist", () => {
      return request(app)
        .get("/api/articles?topic=invalid")
        .expect(204)
        .then((response) => {
          expect(response.body).toEqual({});
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
      test("POST: 201 - post a new comment on the comments table, tied to the specified article_id", () => {
        const newComment = {
          username: "butter_bridge",
          body: "This is a test comment",
        };

        return request(app)
          .post("/api/articles/2/comments")
          .send(newComment)
          .expect(201)
          .then((response) => {
            const { newComment } = response.body;
            expect(newComment).toMatchObject({
              article_id: 2,
              body: "This is a test comment",
              comment_id: expect.any(Number),
              created_at: expect.any(String),
            });
          });
      });
      test("POST: 404 - responds with an error when a comment post is attempted with an article_id that doesnt exist", () => {
        const newComment = {
          username: "butter_bridge",
          body: "This is a test comment",
        };
        return request(app)
          .post("/api/articles/9999/comments")
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("article does not exist");
          });
      });
      test("POST: 400 - responds with an error when a comment post is attempted with an invalid article_id", () => {
        const newComment = {
          username: "butter_bridge",
          body: "This is a test comment",
        };
        return request(app)
          .post("/api/articles/not-an-id/comments")
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request");
          });
      });
      test("POST: 404 - responds with an error when a comment post is attempted with sent missing object properties", () => {
        const newComment = {
          username: "butter_bridge",
        };
        return request(app)
          .post("/api/articles/2/comments")
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request: missing required fields");
          });
      });
      test("POST: 400 - responds with an error when a comment post is attempted with a body holding the wrong data type", () => {
        const newComment = {
          username: "butter_bridge",
          body: 0,
        };
        return request(app)
          .post("/api/articles/2/comments")
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request: wrong data type");
          });
      });
      test("POST: 404 - responds with an error when a comment post is attempted with a username that doesnt exist in the users table", () => {
        const newComment = {
          username: "Lewis",
          body: "This is a test comment",
        };
        return request(app)
          .post("/api/articles/2/comments")
          .send(newComment)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("username not found");
          });
      });
      test("PATCH: 200 - increments the votes on the specified article", () => {
        const voteUpdate = {
          inc_votes: 1,
        };

        return request(app)
          .patch("/api/articles/1")
          .send(voteUpdate)
          .expect(200)
          .then((response) => {
            const { updatedArticle } = response.body;
            expect(updatedArticle).toMatchObject({
              article_id: 1,
              votes: 101,
              title: "Living in the shadow of a great man",
              body: "I find this existence challenging",
              author: "butter_bridge",
              created_at: "2020-07-09T20:11:00.000Z",
            });
            expect(updatedArticle.votes).toBe(100 + 1);
          })
          .then(() => {
            const voteUpdate2 = {
              inc_votes: -100,
            };
            return request(app)
              .patch("/api/articles/1")
              .send(voteUpdate2)
              .expect(200)
              .then((response) => {
                const { updatedArticle } = response.body;
                expect(updatedArticle).toMatchObject({
                  article_id: 1,
                  votes: 1,
                  title: "Living in the shadow of a great man",
                  body: "I find this existence challenging",
                  author: "butter_bridge",
                  created_at: "2020-07-09T20:11:00.000Z",
                });
                expect(updatedArticle.votes).toBe(101 - 100);
              });
          });
      });
      test("PATCH: 404 - responds with an error when an article patch is attempted on an article_id that does not exist", () => {
        const voteUpdate = {
          inc_votes: 1,
        };
        return request(app)
          .patch("/api/articles/9999")
          .send(voteUpdate)
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toEqual("article does not exist");
          });
      });
      test("PATCH: 400 - responds with an error when an article patch is attempted with an invalid article_id ", () => {
        const voteUpdate = {
          inc_votes: "test string",
        };
        return request(app)
          .patch("/api/articles/1")
          .send(voteUpdate)
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toEqual("bad request");
          });
      });
      test("PATCH: 400 - responds with an error when an article patch is attempted with missing inc_votes data ", () => {
        const voteUpdate = {};
        return request(app)
          .patch("/api/articles/1")
          .send(voteUpdate)
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toEqual("bad request");
          });
      });
    });
  });
});

describe("/api/comments", () => {
  describe("/api/comments/:comment_id", () => {
    test("DELETE: 204 - responds by deleteing a comment via its comment_id and returning no content", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
    test("DELETE: 404 - returns an error if the comment_id doesn't exist", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toEqual("comment does not exist");
        });
    });
    test("DELETE: 400 - returns an error if the comment_id is invalid", () => {
      return request(app)
        .delete("/api/comments/not-valid-id")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toEqual("bad request");
        });
    });
  });
});

describe("/api/users", () => {
  describe("/api/users", () => {
    test("GET: 200 - return an array of users objects", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((result) => {
          const users = result.body.users;
          users.forEach((user) => {
            expect(typeof user.username).toBe("string");
            expect(typeof user.name).toBe("string");
            expect(typeof user.avatar_url).toBe("string");
          });
        });
    });
    test("GET: 404 - responds with a custom error when a search is attempted for all users but that endpoint has no data'", () => {
      return db.query("DELETE FROM comments").then(() => {
        return db.query("DELETE FROM articles").then(() => {
          return db.query("DELETE FROM users").then(() => {
            return request(app)
              .get("/api/users")
              .expect(404)
              .then((response) => {
                expect(response.body.msg).toBe("no users available");
              });
          });
        });
      });
    });
  });
});
