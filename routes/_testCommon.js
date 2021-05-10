"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Event = require("../models/event");
const { createToken } = require("../helpers/tokens");

const testEventIds = [];

async function commonBeforeAll () {
	await db.query("DELETE FROM users");
	await db.query("DELETE FROM events");

	testEventIds[0] = (await Event.create({
		title: "Event1",
		description: "EventDesc1",
		eventDate: "2022-06-08",
		eventTime: "06:00 PM",
		city: "New York",
		state: "NY",
		country: "US",
		imgUrl:
			"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
	})).id;
	testEventIds[1] = (await Event.create({
		title: "Event2",
		description: "EventDesc2",
		eventDate: "2022-06-08",
		eventTime: "11:00 AM",
		city: "Austin",
		state: "TX",
		country: "US",
		imgUrl:
			"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
	})).id;

	await User.register({
		username: "u1",
		firstName: "U1F",
		lastName: "U1L",
		email: "user1@user.com",
		password: "password1",
		profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
		isAdmin: false
	});
	await User.register({
		username: "u2",
		firstName: "U2F",
		lastName: "U2L",
		email: "user2@user.com",
		password: "password2",
		profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
		isAdmin: false
	});
}

async function commonBeforeEach () {
	await db.query("BEGIN");
}

async function commonAfterEach () {
	await db.query("ROLLBACK");
}

async function commonAfterAll () {
	await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testEventIds,
	u1Token,
	u2Token,
	adminToken
};
