class Vector2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(vec2) {
		this.x += vec2.x;
		this.y += vec2.y;

		return this;
	}

	substract(vec2) {
		this.add(vec2.clone().multiply(-1));

		return this;
	}

	multiply(n) {
		this.x *= n;
		this.y *= n;

		return this;
	}

	divide(n) {
		return this.multiply(1 / n);
	}

	dot(vec2) {
		return this.x * vec2.x + this.y * vec2.y;
	}

	cross(vec2) {
		return this.x * vec2.y - this.y * vec2.x;
	}

	matmul(twobytwo) {
		this.x = twobytwo[0][0] * this.x + twobytwo[0][1] * this.y;
		this.y = twobytwo[1][0] * this.x + twobytwo[1][1] * this.y;
	}

	perp() {
		return new Vector2(this.y, - this.x);
	}

	reflect(motion) {
		const perp = this.perp().normalize();
		return perp.multiply(perp.dot(motion) * 2).substract(motion).multiply(-1);
	}

	clone() {
		return new Vector2(this.x, this.y);
	}

	equals(vec2) {
		return this.x === vec2.x && this.y === vec2.y;
	}

	size() {
		return Math.hypot(this.x, this.y);
	}

	normalize() {
		return this.divide(this.size());
	}

	get pos() {
		return [this.x, this.y];
	}
}

export default Vector2;
