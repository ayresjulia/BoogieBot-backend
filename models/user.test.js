"use strict";

const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	newUser,
	user1,
	user2
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate user", function () {
	test("works with username and password", async function () {
		const user = await User.authenticate("u1", "password1");
		expect(user).toEqual(user1);
	});

	test("unauthorized if no such user", async function () {
		try {
			await User.authenticate("nope", "password");
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});

	test("unauthorized if wrong password", async function () {
		try {
			await User.authenticate("c1", "wrong");
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});
});

/************************************** register */

describe("register new user", function () {
	test("registers new user", async function () {
		let user = await User.register({
			...newUser,
			password: "password"
		});
		expect(user).toEqual(newUser);
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(false);
		expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
	});

	test("registers admin", async function () {
		let user = await User.register({
			...newUser,
			password: "password",
			isAdmin: true
		});
		expect(user).toEqual({ ...newUser, isAdmin: true });
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(true);
		expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
	});

	test("bad request with duplicate data", async function () {
		try {
			await User.register({
				...newUser,
				password: "password"
			});
			await User.register({
				...newUser,
				password: "password"
			});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** findAll */

describe("find all users", function () {
	test("displays list of all users", async function () {
		const users = await User.findAll();
		expect(users).toEqual([ user1, user2 ]);
	});
});

/************************************** get */

describe("get user by username", function () {
	test("gets user by username", async function () {
		let user = await User.get("u1");
		expect(user).toEqual(user1);
	});

	test("not found if username doesn't exist", async function () {
		try {
			await User.get("nope");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** update */

describe("update user with partial data", function () {
	const updateData = {
		firstName: "NewF",
		lastName: "NewF",
		email: "new@email.com",
		isAdmin: true
	};

	test("updates user with passed data", async function () {
		let event = await User.update("u1", updateData);
		expect(event).toEqual({
			username: "u1",
			profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
			...updateData
		});
	});

	test("works when updating password", async function () {
		let user = await User.update("u1", {
			password: "new"
		});
		expect(user).toEqual({
			username: "u1",
			firstName: "U1F",
			lastName: "U1L",
			email: "u1@email.com",
			profileUrl: "https://supersimple.com/wp-content/uploads/peek-a-boo-800-800-200x200.jpg",
			isAdmin: false
		});
		const found = await db.query("SELECT * FROM users WHERE username = 'u1'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
	});

	test("not found error if username doesn't exist", async function () {
		try {
			await User.update("nope", {
				firstName: "test"
			});
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test("bad request error if no data passed in", async function () {
		expect.assertions(1);
		try {
			await User.update("c1", {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/************************************** remove */

describe("remove user from database", function () {
	test("works when username is passed in", async function () {
		await User.remove("u1");
		const res = await db.query("SELECT * FROM users WHERE username='u1'");
		expect(res.rows.length).toEqual(0);
	});

	test("not found error if username doesn't exist", async function () {
		try {
			await User.remove("nope");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
