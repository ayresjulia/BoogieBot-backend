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
	adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /events */

describe("POST /events/new", function () {
	test("ok for admin", async function () {
		const resp = await request(app)
			.post(`/events/new`)
			.send({
				title: "New",
				description: "New",
				eventDate: "1993-07-03",
				eventTime: "11:00 AM",
				city: "New Orleans",
				state: "LA",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
				hostUsername: "u1"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			event: {
				id: expect.any(Number),
				title: "New",
				description: "New",
				eventDate: "1993-07-03",
				eventTime: "11:00 AM",
				city: "New Orleans",
				state: "LA",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
				hostUsername: "u1"
			}
		});
	});

	test("bad request with missing data", async function () {
		const resp = await request(app)
			.post(`/events/new`)
			.send({
				title: "nope"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request with invalid data", async function () {
		const resp = await request(app)
			.post(`/events/new`)
			.send({
				title: 123,
				description: "New",
				eventDate: "1993-07-03",
				eventTime: "11:00 AM",
				city: "New Orleans",
				state: "LA",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
				hostUsername: "u1"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});
});

/************************************** GET /events */

describe("GET /events", function () {
	test("ok for anon", async function () {
		const resp = await request(app).get(`/events`);
		expect(resp.body).toEqual({
			events: [
				{
					id: expect.any(Number),
					title: "Event1",
					description: "EventDesc1",
					eventDate: "2022-06-08",
					eventTime: "06:00 PM",
					city: "New York",
					state: "NY",
					country: "US",
					imgUrl:
						"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
					hostUsername: "u1"
				},
				{
					id: expect.any(Number),
					title: "Event2",
					description: "EventDesc2",
					eventDate: "2022-06-08",
					eventTime: "11:00 AM",
					city: "Austin",
					state: "TX",
					country: "US",
					imgUrl:
						"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
					hostUsername: "u2"
				}
			]
		});
	});
});

/************************************** GET /events/:id */

describe("GET /events/:id", function () {
	test("works for anon", async function () {
		const resp = await request(app).get(`/events/${testEventIds[0]}`);
		expect(resp.body).toEqual({
			event: {
				id: testEventIds[0],
				title: "Event1",
				description: "EventDesc1",
				eventDate: "2022-06-08",
				eventTime: "06:00 PM",
				city: "New York",
				state: "NY",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
				host: {
					username: "u1",
					firstName: "U1F",
					lastName: "U1L",
					email: "user1@user.com"
				}
			}
		});
	});

	test("not found for no such event", async function () {
		const resp = await request(app).get(`/events/0`);
		expect(resp.statusCode).toEqual(404);
	});
});

/************************************** PATCH /events/:id */

describe("PATCH /events/:id", function () {
	test("works for admin", async function () {
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
				description: "EventDesc1",
				eventDate: "2022-06-08",
				eventTime: "06:00 PM",
				city: "New York",
				state: "NY",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
				hostUsername: "u1"
			}
		});
	});

	test("unauth for others", async function () {
		const resp = await request(app)
			.patch(`/events/${testEventIds[1]}`)
			.send({
				title: "E-New"
			})
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found if no such event", async function () {
		const resp = await request(app)
			.patch(`/events/0`)
			.send({
				id: "nope"
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request on id change attempt", async function () {
		const resp = await request(app)
			.patch(`/events/${testEventIds[0]}`)
			.send({
				id: 56
			})
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(400);
	});

	test("bad request with invalid data", async function () {
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

describe("DELETE /events/:id", function () {
	test("works for admin", async function () {
		const resp = await request(app)
			.delete(`/events/${testEventIds[0]}`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.body).toEqual({ deleted: testEventIds[0] });
	});

	test("unauth for others", async function () {
		const resp = await request(app)
			.delete(`/events/${testEventIds[1]}`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(resp.statusCode).toEqual(401);
	});

	test("not found for no such event", async function () {
		const resp = await request(app)
			.delete(`/events/0`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(resp.statusCode).toEqual(404);
	});
});
