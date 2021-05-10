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
							country,
							img_url)
    VALUES ('Event1', 'EventDesc1', '2022-06-07', '06:00 PM', 'New York', 'NY', 'US', 'https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'),
           ('Event2', 'EventDesc2', '2022-06-08', '11:00 AM', 'Austin', 'TX', 'US', 'https://images.unsplash.com/photo-1532117182044-031e7cd916ee?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')
    RETURNING id`
	);
	testEventIds.splice(0, 0, ...resultsEvents.rows.map((r) => r.id));

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
