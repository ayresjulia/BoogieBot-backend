"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Event = require("./event.js");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testEventIds,
	newEvent,
	event1,
	event2
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create a new event", function () {
	test("creates new event successfully", async function () {
		let event = await Event.create(newEvent);
		expect(event).toEqual({
			...newEvent,
			id: expect.any(Number)
		});
	});
});

/************************************** findAll */

describe("find all events in the database", function () {
	test("finds all events in db", async function () {
		let events = await Event.findAll();

		expect(events).toEqual([
			{ ...event1, id: testEventIds[0] },
			{ ...event2, id: testEventIds[1] }
		]);
	});
});

/************************************** get */

describe("gets event by id", function () {
	test("works when getting event by id", async function () {
		let event = await Event.get(testEventIds[0]);
		expect(event).toEqual({
			...event1,
			id: testEventIds[0],
			host: {
				username: "u1",
				firstName: "U1F",
				lastName: "U1L",
				email: "u1@email.com"
			},
			moodboard: []
		});
	});

	test("not found if no such event", async function () {
		try {
			await Event.get(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe("update event partially", function () {
	let updateData = {
		title: "New Title",
		description: "New Desc wow so cool"
	};
	test("updates event with data passed", async function () {
		let event = await Event.update(testEventIds[0], updateData);
		expect(event).toEqual({
			id: testEventIds[0],
			event_date: "2022-06-07",
			event_time: "06:00 PM",
			city: "New York",
			state: "NY",
			country: "US",
			img_url:
				"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
			hostUsername: "u1",
			...updateData
		});
	});

	test("not found if no such event", async function () {
		try {
			await Event.update(0, {
				title: "test"
			});
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test("throws bad request error with no data", async function () {
		try {
			await Event.update(testEventIds[0], {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe("remove an event using id", function () {
	test("works when removing event by id", async function () {
		await Event.remove(testEventIds[0]);
		const res = await db.query("SELECT id FROM events WHERE id=$1", [ testEventIds[0] ]);
		expect(res.rows.length).toEqual(0);
	});

	test("not found if no such event", async function () {
		try {
			await Event.remove(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
