const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");

describe("create user token", () => {
	test("creates user token if user is not an admin", () => {
		const token = createToken({ username: "test", isAdmin: false });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat: expect.any(Number),
			username: "test",
			isAdmin: false
		});
	});

	test("creates user token if user is an admin", () => {
		const token = createToken({ username: "test", isAdmin: true });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat: expect.any(Number),
			username: "test",
			isAdmin: true
		});
	});

	test("creates user token if admin status not specified (defaults to isAdmin:false)", () => {
		const token = createToken({ username: "test" });
		const payload = jwt.verify(token, SECRET_KEY);
		expect(payload).toEqual({
			iat: expect.any(Number),
			username: "test",
			isAdmin: false
		});
	});
});
