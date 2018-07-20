import Entity from "./Entity";
import Vector2 from "../geometry/Vector2";

class EntityElectron extends Entity {
	constructor(game, position, radius) {
		super(game, position);

		this.radius = radius;
		this.boundModelAccuracy = 6;
		this.friction = 0;
		this.threshold = 1000;
	}

	update() {
		super.update();

		const previousMotion = this.motion;
		const motions = [];
		this.game.obstacles.forEach(v => {
			v.getSides().forEach(([p1, p2]) => {
				const u = p2.clone().substract(p1);

				const distance = Math.abs(this.cross(u) + u.cross(p1)) / u.size();

				const d1 = this.clone().substract(p1).dot(u.clone().normalize());

				if(distance <= this.radius && d1 >= -this.radius && d1 <= u.size() + this.radius) {
					motions.push([u.reflect(this.motion), distance]);
					this.add(u.perp().normalize().multiply(distance));
				}
			});
		});

		if(motions.length > 0) {
			const finalMotion = motions.reduce((prev, curr) => {
				const diff = Math.abs(curr[1] - prev[1]);

				if(diff <= this.threshold) {
					const thetaDiff1 = Math.asin(
						previousMotion.cross(curr[0]) / (previousMotion.size() * curr[0].size())
					);

					const thetaDiff2 = -Math.asin(
						previousMotion.cross(prev[0]) / (previousMotion.size() * prev[0].size())
					);

					const newMotion = previousMotion.clone().multiply(-1);
					const newTheta = (thetaDiff1 + thetaDiff2) / 2;

					newMotion.matmul([
						[Math.cos(newTheta), -Math.sin(newTheta)],
						[Math.sin(newTheta), Math.cos(newTheta)]
					]);
					prev[0] = newMotion;
					return prev;
				}

				if(curr[1] < prev[1]) return curr;
				return prev;
			}, [new Vector2(0, 0), Infinity])[0];

			this.motion = finalMotion.normalize().multiply(4);
		}

		if(this.clone().substract(this.game.center).size() > 250) {
			this.motion.multiply(0);
		}
	}

	render(ctx) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = '#03a9f4';
		ctx.fill();
	}

	get polygon() {
		return [...Array(this.boundModelAccuracy)].map((_, n) => {
			const theta = (n - 1/2) * Math.PI * 2 / this.boundModelAccuracy;

			return [
				this.x + Math.cos(theta) * this.radius,
				this.y + Math.sin(theta) * this.radius
			];
		});
	}
}

export default EntityElectron;
