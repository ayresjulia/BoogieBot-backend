"use strict";

const request = require("supertest");
const app = require("../app");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testEventIds,
	u1Token,
	adminToken,
	event1,
	event2,
	event
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /events/new */

describe("post request to create new event", function () {
	test("creates new event for admin", async function () {
		const resp = await request(app)
			.post(`/events/new`)
			.send({ ...event, title: "New" })
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			event: {
				id: expect.any(Number),
				...event,
				title: "New"
			}
		});
	});

	test("creates new event for non-admin", async function () {
		const resp = await request(app)
			.post(`/events/new`)
			.send({ ...event, title: "New" })
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			event: {
				id: expect.any(Number),
				...event,
				title: "New"
			}
		});
	});

	test("bad request error with missing data", async function () {
		const resp = await request(app)
			.post(`/events/new`)
			.send({
				title: "nope"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request error with invalid data", async function () {
		const resp = await request(app)
			.post(`/events/new`)
			.send({ ...event, title: 123 })
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /events */

describe("get request to get a list of all events", function () {
	test("admin can get entire list of events", async function () {
		const resp = await request(app).get(`/events`).set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			events: [ { ...event1, id: expect.any(Number) }, { ...event2, id: expect.any(Number) } ]
		});
	});
});

/************************************** GET /events/:id */

describe("get request to get event details by id", function () {
	test("admin can get event by id", async function () {
		const resp = await request(app)
			.get(`/events/${testEventIds[0]}`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			event: {
				id: testEventIds[0],
				...event1,
				host: {
					username: "u1",
					firstName: "U1F",
					lastName: "U1L",
					email: "user1@user.com"
				}
			}
		});
	});

	test("user host can get their event by id", async function () {
		const resp = await request(app)
			.get(`/events/${testEventIds[0]}`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			event: {
				id: testEventIds[0],
				...event1,
				host: {
					username: "u1",
					firstName: "U1F",
					lastName: "U1L",
					email: "user1@user.com"
				}
			}
		});
	});

	test("not found error if event id doesn't exist", async function () {
		const resp = await request(app).get(`/events/0`).set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /events/:id */

describe("patch request to update event by id", function () {
	test("admin can update event by id", async function () {
		const resp = await request(app)
			.patch(`/events/${testEventIds[0]}`)
			.send({
				title: "E-New"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({
			event: {
				id: expect.any(Number),
				title: "E-New",
				...patchEvent
			}
		});
	});
	test("user host can update event by id", async function () {
		const resp = await request(app)
			.patch(`/events/${testEventIds[0]}`)
			.send({
				title: "RegularUserUpdate"
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({
			event: {
				id: expect.any(Number),
				title: "RegularUserUpdate",
				...patchEvent
			}
		});
	});

	test("unauthorized for non-users or non-hosts", async function () {
		const resp = await request(app).patch(`/events/${testEventIds[1]}`).send({
			title: "E-New"
		});
		expect(resp.statusCode).toEqual(401);
	});

	test("not found error if event id doesn't exist", async function () {
		const resp = await request(app)
			.patch(`/events/0`)
			.send({
				id: "nope"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request error if trying to change id of the event", async function () {
		const resp = await request(app)
			.patch(`/events/${testEventIds[0]}`)
			.send({
				id: 56
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request error with invalid data", async function () {
		const resp = await request(app)
			.patch(`/events/${testEventIds[0]}`)
			.send({
				title: 123
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** DELETE /events/:id */

describe("delete request to remove event by id", function () {
	test("admin can delete event by id", async function () {
		const resp = await request(app)
			.delete(`/events/${testEventIds[0]}`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: testEventIds[0] });
	});

	test("user host can delete their event by id", async function () {
		const resp = await request(app)
			.delete(`/events/${testEventIds[0]}`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.body).toEqual({ deleted: testEventIds[0] });
	});

	test("unauthorized for non-users and non-hosts", async function () {
		const resp = await request(app).delete(`/events/${testEventIds[0]}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found error if event id doesn't exist", async function () {
		const resp = await request(app)
			.delete(`/events/0`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});
});
