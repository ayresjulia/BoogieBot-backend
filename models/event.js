"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for events. */

class Event {
	/** Create an Event (from data), update db, return new event data.
   *
   * data should be { title, description, date, time, city, state, country, username}
   *
   * Returns { id, title, description, date, time, city, state, country, username}
   **/

	static async create (data) {
		const result = await db.query(
			`INSERT INTO events (title,
                          description,
                          event_date, 
                          event_time, 
                          city, 
                          state, 
                          country)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, title, description, event_date AS "eventDate", event_time AS "eventTime", city, state, country`,
			[
				data.title,
				data.description,
				data.eventDate,
				data.eventTime,
				data.city,
				data.state,
				data.country
			]
		);
		let event = result.rows[0];

		return event;
	}

	/** Find all events (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - title (will find case-insensitive, partial matches)
   * - username (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, description, username }, ...]
   * */

	static async findAll ({ title } = {}) {
		let query = `SELECT id,
							title,
							description,
							event_date AS "eventDate", 
							event_time AS "eventTime", 
							city, 
							state, 
							country
				 FROM events`;
		let whereExpressions = [];
		let queryValues = [];

		// For each possible search term, add to whereExpressions and
		// queryValues so we can generate the right SQL

		if (title !== undefined) {
			queryValues.push(`%${title}%`);
			whereExpressions.push(`title ILIKE $${queryValues.length}`);
		}

		if (whereExpressions.length > 0) {
			query += " WHERE " + whereExpressions.join(" AND ");
		}

		// Finalize query and return results

		query += " ORDER BY title";
		const eventsRes = await db.query(query, queryValues);
		return eventsRes.rows;
	}

	/** Given a event id, return data about event.
   *
   * Returns { id, title, description, date, time, city, state, country, username }
   *   where user is { username, frist_name, last_name, email }
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
					country
           FROM events
           WHERE id = $1`,
			[ id ]
		);

		const event = eventRes.rows[0];

		if (!event) throw new NotFoundError(`No event found with ID: ${id}`);

		return event;
	}

	/** Update event data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the fields; this only changes provided ones.
   *
   * Data can include: { title, description, date, time, city, state, country }
   *
   * Returns { id, title, description, date, time, city, state, country, username }
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
                                country`;
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
