const request = require("supertest");
const testData = require("../db/data/test-data");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const endPointsJson = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("should return a 200 status code", () => {
    return request(app).get("/api/topics").expect(200);
  });
  test("should return an array of all topics, each with a 'slug' and 'description' property", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
  test("should return a 404 status code and 'Not Found' when passed an incorrectly spelled api request", () => {
    return request(app)
      .get("/api/topisc")
      .expect(404)
      .then(({ res }) => {
        expect(res.statusMessage).toBe("Not Found");
      });
  });
});

describe("GET /api", () => {
  test("should return a 200 status code", () => {
    return request(app).get("/api").expect(200);
  });
  test("should return an accurate JSON object that reflects the contents of the endpoints.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(typeof JSON.stringify(body.endPoints)).toBe("string");
        expect(typeof body.endPoints).toBe("object");
        expect(body.endPoints).toEqual(endPointsJson);
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("should return a 200 status code", () => {
    return request(app).get("/api/articles/2").expect(200);
  });
  test("should return the specific article that matches the passed article_id, complete with article_id, votes and a user friendly created_at", () => {
    return request(app)
      .get("/api/articles/3")
      .then(({ body }) => {
        expect(body.article).toEqual({
          article_id: 3,
          votes: 0,
          title: "Eight pug gifs that remind me of mitch",
          topic: "mitch",
          author: "icellusedkars",
          body: "some gifs",
          created_at: "Tue Nov 03 2020 09:12:00 GMT+0000 (Greenwich Mean Time)",
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("should return a 404 status code and 'Article Not Found' when passed an article_id that does not exist", () => {
    return request(app)
      .get("/api/articles/99")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Article Not Found");
      });
  });
  test("should return a 400 status code and 'Invalid Data Type' when passed an article_id that is not a number", () => {
    return request(app)
      .get("/api/articles/six")
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid Data Type");
      });
  });
});

describe("GET /api/articles", () => {
  test("should return a 200 status code and an array of all article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
        expect(body.articles.length).toBe(13);
        body.articles.forEach((article) => {
          expect(typeof article).toBe("object");
        });
      });
  });
  test("should return each article with keys of author, title, article_id, topic, created_at, votes, article_img_url, and comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
        });
      });
  });
  test("should return each article without a body key", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("should return the articles sorted by date in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  // test('should return a 400 status code and "Invalid Order" when passed an order that is neither "asc" or "desc"', () => {
  //   return request(app)
  //     .get("/api/articles?order=down")
  //     .expect(400)
  //     .then(({ body }) => {
  //       expect(body.message).toBe("Invalid Order");
  //     });
  // });
  // test('should return a 200 status code and "No Matching Articles Found" when passed a valid query that returns no result rows', () => {
  //   return request(app)
  //     .get("/api/articles?author=videogames")
  //     .expect(200)
  //     .then(({ body }) => {
  //       expect(body.message).toBe("No Matching Articles Found");
  //     });
  // });
  // test("should return a 200 status code and an array of articles matching a valid query", () => {
  //   return request(app)
  //     .get("/api/articles?topic=cats")
  //     .expect(200)
  //     .then(({ body }) => {
  //       expect(body.articles).toEqual([
  //         {
  //           article_id: 5,
  //           author: "rogersop",
  //           title: "UNCOVERED: catspiracy to bring down democracy",
  //           topic: "cats",
  //           created_at: "2020-08-03T13:14:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "2",
  //         },
  //       ]);
  //     });
  // });
  // test("should return a 200 status code and matching articles when provided multiple queries", () => {
  //   return request(app)
  //     .get("/api/articles?topic=mitch&author=butter_bridge")
  //     .expect(200)
  //     .then(({ body }) => {
  //       expect(body.articles).toEqual([
  //         {
  //           article_id: 12,
  //           author: "butter_bridge",
  //           title: "Moustache",
  //           topic: "mitch",
  //           created_at: "2020-10-11T11:24:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "0",
  //         },
  //         {
  //           article_id: 13,
  //           author: "butter_bridge",
  //           title: "Another article about Mitch",
  //           topic: "mitch",
  //           created_at: "2020-10-11T11:24:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "0",
  //         },
  //         {
  //           article_id: 1,
  //           author: "butter_bridge",
  //           title: "Living in the shadow of a great man",
  //           topic: "mitch",
  //           created_at: "2020-07-09T20:11:00.000Z",
  //           votes: 100,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "11",
  //         },
  //         {
  //           article_id: 9,
  //           author: "butter_bridge",
  //           title: "They're not exactly dogs, are they?",
  //           topic: "mitch",
  //           created_at: "2020-06-06T09:10:00.000Z",
  //           votes: 0,
  //           article_img_url:
  //             "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
  //           comment_count: "2",
  //         },
  //       ]);
  //     });
  // });
});

xdescribe("POST /api/articles/:article_id/comments", () => {
  test("should return a 201 status code and the posted comment as an object", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({ username: "Big_Geoff", body: "I like trains" })
      .expect(201)
      .then(({ body }) => {
        expect(typeof body.comment).toBe("object");
      });
  });
});
