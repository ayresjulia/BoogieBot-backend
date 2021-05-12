"use strict";

const request = require("supertest");
const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	adminToken,
	user,
	patchUserData,
	user1,
	user2
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users */

describe("POST /users", function () {
	test("works for admins: create non-admin", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				...user,
				email: "new@email.com",
				password: "password",
				isAdmin: false
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			user: {
				...user,
				email: "new@email.com",
				isAdmin: false
			},
			token: expect.any(String)
		});
	});

	test("works for admins: create admin", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				...user,
				email: "new@email.com",
				password: "password",
				isAdmin: true
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			user: {
				...user,
				email: "new@email.com",
				isAdmin: true
			},
			token: expect.any(String)
		});
	});

	test("unauth for users", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				...user,
				email: "new@email.com",
				password: "password-new",
				isAdmin: true
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app).post("/users").send({
			...user,
			email: "new@email.com",
			password: "password-new",
			isAdmin: true
		});
		expect(resp.statusCode).toEqual(401);
	});

	test("bad request if missing data", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				username: "u-new"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request if invalid data", async function () {
		const resp = await request(app)
			.post("/users")
			.send({
				...user,
				email: "not-an-email",
				password: "password-new",
				isAdmin: true
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /users */

describe("GET /users", function () {
	test("works for admins", async function () {
		const resp = await request(app).get("/users").set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ users: [ user1, user2 ] });
	});

	test("unauth for non-admin users", async function () {
		const resp = await request(app).get("/users").set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app).get("/users");
		expect(resp.statusCode).toEqual(401);
	});
});

/************************************** GET /users/:username */

describe("GET /users/:username", function () {
	test("works for admin", async function () {
		const resp = await request(app)
			.get(`/users/u1`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ user: { ...user1 } });
	});

	test("works for same user", async function () {
		const resp = await request(app).get(`/users/u1`).set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({ user: { ...user1 } });
	});

	test("unauth for anon", async function () {
		const resp = await request(app).get(`/users/u1`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found if user not found", async function () {
		const resp = await request(app)
			.get(`/users/nope`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
	test("works for admins", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName: "New"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			user: { ...patchUserData, firstName: "New" }
		});
	});

	test("works for same user", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName: "New"
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			user: { ...patchUserData, firstName: "New" }
		});
	});

	test("unauth if not same user", async function () {
		const resp = await request(app)
			.patch(`/users/u2`)
			.send({
				firstName: "New"
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app).patch(`/users/u1`).send({
			firstName: "New"
		});
		expect(resp.statusCode).toEqual(401);
	});

	test("not found if no such user", async function () {
		const resp = await request(app)
			.patch(`/users/nope`)
			.send({
				firstName: "Nope"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});

	test("bad request if invalid data", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				firstName: 42
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("works: can set new password", async function () {
		const resp = await request(app)
			.patch(`/users/u1`)
			.send({
				password: "new-password"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ user: { ...user1 } });
		const isSuccessful = await User.authenticate("u1", "new-password");
		expect(isSuccessful).toBeTruthy();
	});
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
	test("works for admin", async function () {
		const resp = await request(app)
			.delete(`/users/u1`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: "u1" });
	});

	test("works for same user", async function () {
		const resp = await request(app)
			.delete(`/users/u1`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({ deleted: "u1" });
	});

	test("unauth if not same user", async function () {
		const resp = await request(app)
			.delete(`/users/u2`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("unauth for anon", async function () {
		const resp = await request(app).delete(`/users/u1`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found if user missing", async function () {
		const resp = await request(app)
			.delete(`/users/nope`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});
});
