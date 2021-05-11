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
		const result = await db.query(`SELECT id,
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
				 ORDER BY id`);

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

		delete event.hostUsername;
		event.host = hostRes.rows[0];

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
                                event_date AS "eventDate", 
                          		event_time AS "eventTime",  
                                city, 
                                state, 
								country,
								img_url AS "imgUrl",
								host_username AS "hostUsername"`;
		const result = await db.query(querySql, [ ...values, id ]);
		const event = result.rows[0];

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
}

module.exports = Event;
