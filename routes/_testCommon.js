"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Event = require("../models/event");
const { createToken } = require("../helpers/tokens");

const testEventIds = [];

const user = {
	username: "new",
	firstName: "first",
	lastName: "last",
	profileUrl: ""
};

const patchUserData = {
	username: "u1",
	lastName: "U1L",
	email: "user1@user.com",
	profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
	isAdmin: false
};

const user1 = {
	username: "u1",
	firstName: "U1F",
	lastName: "U1L",
	email: "user1@user.com",
	profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
	isAdmin: false
};

const user2 = {
	username: "u2",
	firstName: "U2F",
	lastName: "U2L",
	email: "user2@user.com",
	profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
	isAdmin: false
};

const event = {
	description: "EventDesc1",
	eventDate: "2022-06-08",
	eventTime: "06:00 PM",
	city: "New York",
	state: "NY",
	country: "US",
	imgUrl:
		"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
	hostUsername: "u1"
};

const event1 = {
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
};

const event2 = {
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
};

async function commonBeforeAll () {
	await db.query("DELETE FROM users");
	await db.query("DELETE FROM events");

	await User.register({ ...user1, password: "password1" });
	await User.register({ ...user2, password: "password2" });

	testEventIds[0] = (await Event.create(event1)).id;
	testEventIds[1] = (await Event.create(event2)).id;
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
	adminToken,
	event,
	event1,
	event2,
	user,
	user1,
	user2,
	patchUserData
};
