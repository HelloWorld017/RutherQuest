import Vector2 from "../geometry/Vector2";

class Entity extends Vector2 {
	constructor(game, position) {
		super(position.x, position.y);

		this.game = game;
		this.entityId = null;
		this.motion = new Vector2(0, 0);
		this.friction = 0.1;
	}

	update() {
		this.add(this.motion);
		this.motion = this.motion.multiply(1 - this.friction);

		if(
			!isFinite(this.x) || !isFinite(this.y)
			|| this.x < -100 || this.x > this.game.width + 100
			|| this.y < -100 || this.y > this.game.height + 100
		)  {
			this.game.despawn(this);
		}
	}

	render(ctx) {

	}

	setDead() {
		
	}

	get polygon() {
		return [];
	}
}

export default Entity;
