import EntityElectron from "./entity/EntityElectron";
import EntityObstacle from "./entity/EntityObstacle";
import Vector2 from "./geometry/Vector2";

class Game {
	constructor() {
		this.canvas = document.querySelector('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.entities = {};
		this.lastEntityId = 0;
		this.tick = 0;
		this.obstacles = [];
		this.deathNote = [];

		this.updateBound = this.update.bind(this);
		this.update();

		this.initObstacle([
			[new Vector2(-30, -30), new Vector2(30, -60), new Vector2(30, 30), new Vector2(-30, 60)]
		]);

		this.drag = false;
		this.dragStart = undefined;
		this.dragEnd = undefined;

		this.attachListener();
	}

	get width() {
		return this.canvas.width;
	}

	get height() {
		return this.canvas.height;
	}

	attachListener() {
		document.addEventListener('mousedown', ({clientX, clientY}) => {
			this.dragStart = new Vector2(clientX, clientY);
			this.drag = true;
		});

		document.addEventListener('mouseup', () => {
			this.finishDrag();
		});

		document.addEventListener('mousemove', ({clientX, clientY}) => {
			if(this.drag) {
				this.dragEnd = new Vector2(clientX, clientY);
			}
		});
	}

	update() {
		this.tick++;
		this.render();
		Object.values(this.entities).forEach(v => {
			v.update();
			v.render(this.ctx);
		});

		this.deathNote.forEach(e => {
			e.setDead();
			delete this.entities[e.entityId];
		});
		this.deathNote = [];

		setTimeout(this.updateBound, 20);
	}

	finishDrag() {
		this.drag = false;

		if(!this.dragEnd || this.dragEnd.equals(this.dragStart)) return;

		const electron = new EntityElectron(this, this.dragStart.clone(), 10);
		electron.motion = this.dragEnd.clone().substract(this.dragStart).normalize().multiply(4);

		this.spawn(electron);
	}

	render() {
		this.ctx.fillStyle = '#f1f2f3';
		this.ctx.fillRect(0, 0, this.width, this.height);

		if(this.drag && this.dragEnd) {
			const dragVector = this.dragEnd
				.clone()
				.substract(this.dragStart)
				.normalize()
				.multiply(100)
				.add(this.dragStart);

			this.ctx.beginPath();
			this.ctx.arc(...this.dragStart.pos, 5, 0, Math.PI * 2);
			this.ctx.fillStyle = '#e91e63';
			this.ctx.fill();

			this.ctx.beginPath();
			this.ctx.moveTo(...this.dragStart.pos);
			this.ctx.lineTo(...dragVector.pos);
			this.ctx.strokeStyle = '#e91e63';
			this.ctx.strokeWidth = 4;
			this.ctx.stroke();
		}
	}

	initObstacle(polygons) {
		polygons.forEach(polygon => {
			const obstacle = new EntityObstacle(this, new Vector2(this.width / 2, this.height / 2), polygon);
			this.spawn(obstacle);
			this.obstacles.push(obstacle);
		});
	}

	spawn(entity) {
		entity.entityId = this.lastEntityId++;
		this.entities[entity.entityId] = entity;
	}

	despawn(entity) {
		this.deathNote.push(entity);
	}
}

export default Game;
