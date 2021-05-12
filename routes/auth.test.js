"use strict";

const request = require("supertest");

const app = require("../app");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token */

describe("post request to create user token from username and password", function () {
	test("creates token with passed username and password", async function () {
		const resp = await request(app).post("/auth/token").send({
			username: "u1",
			password: "password1"
		});
		expect(resp.body).toEqual({
			token: expect.any(String)
		});
	});

	test("unauth with non-existent user", async function () {
		const resp = await request(app).post("/auth/token").send({
			username: "no-such-user",
			password: "password1"
		});
		expect(resp.statusCode).toEqual(401);
	});

	test("unauthorized with wrong password", async function () {
		const resp = await request(app).post("/auth/token").send({
			username: "u1",
			password: "nope"
		});
		expect(resp.statusCode).toEqual(401);
	});

	test("bad request with missing data", async function () {
		const resp = await request(app).post("/auth/token").send({
			username: "u1"
		});
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request with invalid data", async function () {
		const resp = await request(app).post("/auth/token").send({
			username: 42,
			password: "above-is-a-number"
		});
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** POST /auth/register */

describe("post request to register new user", function () {
	test("works for any user: regular or admin", async function () {
		const resp = await request(app).post("/auth/register").send({
			username: "new",
			firstName: "first",
			lastName: "last",
			password: "password",
			email: "new@email.com",
			profileUrl: ""
		});
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			token: expect.any(String)
		});
	});

	test("bad request error with missing data fields", async function () {
		const resp = await request(app).post("/auth/register").send({
			username: "new"
		});
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request error with invalid data", async function () {
		const resp = await request(app).post("/auth/register").send({
			username: "new",
			firstName: "first",
			lastName: "last",
			password: "password",
			email: "not-an-email"
		});
		expect(resp.statusCode).toEqual(400);
	});
});
