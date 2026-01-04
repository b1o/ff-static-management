export class NotFoundError extends Error {
	status = 404;

	constructor(message = "Not Found") {
		super(message);
	}
}

export class ConfilictError extends Error {
	status = 409;
	constructor(message = "Conflict") {
		super(message);
	}
}
export class DatabaseError extends Error {
	status = 500;

	constructor(message = "Database operation failed") {
		super(message);
	}
}

export class UnauthorizedError extends Error {
	status = 401;
	constructor(message = "Unauthorized") {
		super(message);
	}
}

export class ForbiddenError extends Error {
	status = 403;
	constructor(message = "Forbidden") {
		super(message);
	}
}
