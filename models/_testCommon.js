const bcrypt = require("bcrypt");
const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** Common tests for models. */

const testEventIds = [];

const newEvent = {
	title: "Anniversary",
	description: "Doggies 1st anni",
	eventDate: "2022-05-08",
	eventTime: "12:00 PM",
	city: "Chicago",
	state: "IL",
	country: "US",
	imgUrl:
		"https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
	hostUsername: "u1"
};
const event1 = {
	title: "Event1",
	description: "EventDesc1",
	eventDate: "2022-06-07",
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

const newUser = {
	username: "new",
	firstName: "Test",
	lastName: "Tester",
	email: "test@test.com",
	profileUrl: "",
	isAdmin: false
};

const user1 = {
	username: "u1",
	firstName: "U1F",
	lastName: "U1L",
	email: "u1@email.com",
	profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
	isAdmin: false
};

const user2 = {
	username: "u2",
	firstName: "U2F",
	lastName: "U2L",
	email: "u2@email.com",
	profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
	isAdmin: false
};

async function commonBeforeAll () {
	await db.query("DELETE FROM users");
	await db.query("DELETE FROM events");

	await db.query(
		`INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
						  email,
						  profile_url)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com', 'https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com', 'https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg')
        RETURNING username`,
		[
			await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
			await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
		]
	);

	const resultsEvents = await db.query(
		`INSERT INTO events (title, 
							description, 
							event_date, 
							event_time, 
							city, 
							state, 
							country,
							img_url,
							host_username)
    VALUES ('Event1', 'EventDesc1', '2022-06-07', '06:00 PM', 'New York', 'NY', 'US', 'https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'u1'),
           ('Event2', 'EventDesc2', '2022-06-08', '11:00 AM', 'Austin', 'TX', 'US', 'https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'u2')
    RETURNING id`
	);
	testEventIds.splice(0, 0, ...resultsEvents.rows.map((r) => r.id));
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

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	testEventIds,
	newEvent,
	event1,
	event2,
	newUser,
	user1,
	user2
};
