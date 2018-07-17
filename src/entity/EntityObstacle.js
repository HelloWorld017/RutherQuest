import Entity from "./Entity";

class EntityObstacle extends Entity {
	constructor(game, position, polygon) {
		super(game, position);
		this._polygon = polygon;
	}

	getSides() {
		const polygon = this.polygon;
		const sides = [];

		polygon.reduce((prev, curr) => {
			sides.push([prev, curr]);
			return curr;

		}, polygon[polygon.length - 1]);

		return sides;
	}

	render(ctx) {
		const polygon = this.polygon;

		ctx.beginPath();
		ctx.moveTo(...polygon[polygon.length - 1].pos);
		polygon.forEach(v => ctx.lineTo(...v.pos));
		ctx.fillStyle = '#e91e63';
		ctx.fill();
	}

	get polygon() {
		return this._polygon.map(v => v.clone().add(this));
	}
}

export default EntityObstacle;
