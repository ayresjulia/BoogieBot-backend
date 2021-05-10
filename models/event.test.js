"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Event = require("./event.js");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testEventIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
	let newEvent = {
		title: "Anniversary",
		description: "Doggies 1st anni",
		eventDate: "2022-05-08",
		eventTime: "12:00 PM",
		city: "Chicago",
		state: "IL",
		country: "US",
		imgUrl:
			"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
	};

	test("works", async function () {
		let event = await Event.create(newEvent);
		expect(event).toEqual({
			...newEvent,
			id: expect.any(Number)
		});
	});
});

/************************************** findAll */

describe("findAll", function () {
	test("works: no filter", async function () {
		let events = await Event.findAll();
		expect(events).toEqual([
			{
				id: testEventIds[0],
				title: "Event1",
				description: "EventDesc1",
				eventDate: "2022-06-07",
				eventTime: "06:00 PM",
				city: "New York",
				state: "NY",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
			},
			{
				id: testEventIds[1],
				title: "Event2",
				description: "EventDesc2",
				eventDate: "2022-06-08",
				eventTime: "11:00 AM",
				city: "Austin",
				state: "TX",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
			}
		]);
	});

	test("works: by title", async function () {
		let events = await Event.findAll({ title: "Event1" });
		expect(events).toEqual([
			{
				id: testEventIds[0],
				title: "Event1",
				description: "EventDesc1",
				eventDate: "2022-06-07",
				eventTime: "06:00 PM",
				city: "New York",
				state: "NY",
				country: "US",
				imgUrl:
					"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
			}
		]);
	});
});

/************************************** get */

describe("get", function () {
	test("works", async function () {
		let event = await Event.get(testEventIds[0]);
		expect(event).toEqual({
			id: testEventIds[0],
			title: "Event1",
			description: "EventDesc1",
			eventDate: "2022-06-07",
			eventTime: "06:00 PM",
			city: "New York",
			state: "NY",
			country: "US",
			imgUrl:
				"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
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

describe("update", function () {
	let updateData = {
		title: "New Title",
		description: "New Desc wow so cool"
	};
	test("works", async function () {
		let event = await Event.update(testEventIds[0], updateData);
		expect(event).toEqual({
			id: testEventIds[0],
			eventDate: "2022-06-07",
			eventTime: "06:00 PM",
			city: "New York",
			state: "NY",
			country: "US",
			imgUrl:
				"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
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

	test("bad request with no data", async function () {
		try {
			await Event.update(testEventIds[0], {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe("remove", function () {
	test("works", async function () {
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
