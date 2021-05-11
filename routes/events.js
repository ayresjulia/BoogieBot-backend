"use strict";

/** Routes for events. */

const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Event = require("../models/event");
const eventNewSchema = require("../schemas/eventNew.json");
const eventUpdateSchema = require("../schemas/eventUpdate.json");
const router = express.Router({ mergeParams: true });

/** POST /events/new - new event
 *
 * event should be { title, description, event_date, event_time, city, state, country, img_url, host_username}
 *
 * Returns {id, title, description, event_date, event_time, city, state, country, img_url, host_username}
 *
 * Authorization required: correct user or admin
 */

router.post("/new", ensureCorrectUserOrAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, eventNewSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const event = await Event.create(req.body);
		return res.status(201).json({ event });
	} catch (err) {
		return next(err);
	}
});

/** GET / =>
 *   { events: [ {id, title, description, event_date, event_time, city, state, country, img_url, host_username}, ...] }

 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
	try {
		const events = await Event.findAll();
		return res.json({ events });
	} catch (err) {
		return next(err);
	}
});

/** GET /events/id => { event + host }
 *
 * Returns {id, title, description, event_date, event_time, city, state, country, img_url, host}
 *   where host is { username, first_name, last_name, email }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
	try {
		const event = await Event.get(req.params.id);
		return res.json({ event });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /events/id
 *
 * Data can include: { title, description, event_date, event_time, city, state, country, img_url }
 *
 * Returns {id, title, description, event_date, event_time, city, state, country, img_url, host_username}
 *
 * Authorization required: correct user or admin
 */

router.patch("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
	try {
		const validator = jsonschema.validate(req.body, eventUpdateSchema);

		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const event = await Event.update(req.params.id, req.body);
		return res.json({ event });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /events/id  =>  { deleted: id }
 *
 * Authorization required: correct user or admin
 */

router.delete("/:id", ensureCorrectUserOrAdmin, async function (req, res, next) {
	try {
		await Event.remove(req.params.id);
		return res.json({ deleted: +req.params.id });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
