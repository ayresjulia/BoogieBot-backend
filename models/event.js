"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for events. */

class Event {
	/** Create an Event (from data), update db, return new event data.
   *
   * data should be { title, description, event_date, event_time, city, state, country, img_url, host_username}
   *
   * Returns { id, title, description, event_date, event_time, city, state, country, img_url, host_username}
   **/

	static async create (data) {
		const result = await db.query(
			`INSERT INTO events (title,
                          description,
                          event_date, 
                          event_time, 
                          city, 
                          state, 
						  country,
						  img_url,
						  host_username)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING id, title, description, event_date AS "eventDate", event_time AS "eventTime", city, state, country, img_url AS "imgUrl", host_username AS "hostUsername"`,
			[
				data.title,
				data.description,
				data.eventDate,
				data.eventTime,
				data.city,
				data.state,
				data.country,
				data.imgUrl,
				data.hostUsername
			]
		);
		let event = result.rows[0];

		return event;
	}

	/** Find all events.
   *
   * Returns {id, title, description, event_date, event_time, city, state, country, img_url, host_username}
   **/

	static async findAll () {
		let result = await db.query(
			`SELECT id,
					title,
					description,
					event_date AS "eventDate", 
					event_time AS "eventTime", 
					city, 
					state, 
					country,
					img_url AS "imgUrl",
					host_username AS "hostUsername"
				 FROM events`
		);

		return result.rows;
	}

	/** Given a event id, return data about event.
   *
   * Returns {id, title, description, event_date, event_time, city, state, country, img_url, host_username}
   *   where host is { username, first_name, last_name, email }
   *
   * Throws NotFoundError if not found.
   **/

	static async get (id) {
		const eventRes = await db.query(
			`SELECT id,
					title,
					description,
					event_date AS "eventDate", 
                    event_time AS "eventTime", 
					city, 
					state, 
					country,
					img_url AS "imgUrl",
					host_username AS "hostUsername"
           FROM events
           WHERE id = $1`,
			[ id ]
		);

		const event = eventRes.rows[0];

		if (!event) throw new NotFoundError(`No event found with ID: ${id}`);

		const hostRes = await db.query(
			`SELECT username,
					first_name AS "firstName",
					last_name AS "lastName",
					email
			 FROM users
			 WHERE username = $1`,
			[ event.hostUsername ]
		);

		const moodboardRes = await db.query(
			`SELECT event_id AS "eventId",
					inspiration_url AS "inspirationUrl",
					restaurant_name AS "restaurantName",
					restaurant_address AS "restaurantAddress"
			FROM moodboard
			WHERE event_id = $1`,
			[ event.id ]
		);

		event.host = hostRes.rows[0];
		event.moodboard = moodboardRes.rows;

		return event;
	}

	/** Update event data with `data`.
   *
   * This is a "partial update" - data might not contain all the fields; this only changes provided ones.
   *
   * Data can include: { title, description, event_date, event_time, city, state, country, img_url }
   *
   * Returns {id, title, description, event_date, event_time, city, state, country, img_url, host_username}
   *
   * Throws NotFoundError if not found.
   */

	static async update (id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {});
		const idVarIdx = "$" + (values.length + 1);

		const querySql = `UPDATE events 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title,
                                description,
                                event_date, 
                          		event_time,  
                                city, 
                                state, 
								country,
								img_url,
								host_username AS "hostUsername"`;
		const result = await db.query(querySql, [ ...values, id ]);
		const event = result.rows[0];
		console.log("event", event);
		if (!event) throw new NotFoundError(`No event found with ID: ${id}`);

		return event;
	}

	/** Delete given event from database; returns undefined.
   *
   * Throws NotFoundError if event not found.
   **/

	static async remove (id) {
		const result = await db.query(
			`DELETE
			FROM events
			WHERE id = $1
			RETURNING id`,
			[ id ]
		);
		const event = result.rows[0];

		if (!event) throw new NotFoundError(`No event found with ID: ${id}`);
	}

	/** Save to moodboard: update db, returns undefined.
   *
   * - eventId: event connected to moodboard
   * - item: 
   **/

	static async saveToMoodboard (data) {
		const preCheck = await db.query(
			`SELECT id
	       FROM events
	       WHERE id = $1`,
			[ data.event_id ]
		);
		const event = preCheck.rows[0];

		if (!event) throw new NotFoundError(`No event with ID: ${data.event_id}`);

		await db.query(
			`INSERT INTO moodboard (event_id, inspiration_url, restaurant_name, restaurant_address)
	       VALUES ($1, $2, $3, $4)`,
			[ data.event_id, data.inspiration_url, data.restaurant_name, data.restaurant_address ]
		);
	}
}

module.exports = Event;
