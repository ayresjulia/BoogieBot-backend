const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

const testEventIds = [];

async function commonBeforeAll () {
	await db.query("DELETE FROM users");
	await db.query("DELETE FROM events");
	const resultsEvents = await db.query(
		`INSERT INTO events (title, 
							description, 
							event_date, 
							event_time, 
							city, 
							state, 
							country)
    VALUES ('Event1', 'EventDesc1', '2022-06-07', '06:00 PM', 'New York', 'NY', 'US'),
           ('Event2', 'EventDesc2', '2022-06-08', '11:00 AM', 'Austin', 'TX', 'US')
    RETURNING id`
	);
	testEventIds.splice(0, 0, ...resultsEvents.rows.map((r) => r.id));

	await db.query(
		`INSERT INTO users(username,
                          password,
                          first_name,
                          last_name,
						  email)
        VALUES ('u1', $1, 'U1F', 'U1L', 'u1@email.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@email.com')
        RETURNING username`,
		[
			await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
			await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)
		]
	);

	await db.query(
		`INSERT INTO hosts (username, event_id)
        VALUES ('u1' ,$1)`,
		[ testEventIds[0] ]
	);
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
	testEventIds
};
