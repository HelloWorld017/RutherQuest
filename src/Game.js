import EntityElectron from "./entity/EntityElectron";
import EntityObstacle from "./entity/EntityObstacle";
import Vector2 from "./geometry/Vector2";

class Game {
	constructor() {
		this.canvas = document.querySelector('canvas');
		this.ctx = this.canvas.getContext('2d');

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.center = new Vector2(this.width / 2, this.height / 2);

		this.entities = {};
		this.lastEntityId = 0;
		this.tick = 0;
		this.obstacles = [];
		this.deathNote = [];

		this.updateBound = this.update.bind(this);
		this.update();

		this.candidates = [
			[[new Vector2(-30, -30), new Vector2(30, -60), new Vector2(30, 30), new Vector2(-30, 60)]],
			[[new Vector2(-45, -45), new Vector2(45, -45), new Vector2(45, 45), new Vector2(-45, 45)]],
			[[
				new Vector2(-30, -30), new Vector2(0, -60), new Vector2(30, -30),
				new Vector2(30, 30), new Vector2(0, 60), new Vector2(-30, 30)
			]],
			[[new Vector2(-30, 30), new Vector2(-60, -30), new Vector2(30, -30), new Vector2(60, 30)]],
		];

		this.newQuestion();

		this.drag = false;
		this.dragStart = undefined;
		this.dragEnd = undefined;

		this.attachListener();

		const candidates = document.querySelector('.Candidates');

		this.candidates.forEach((v, i) => {
			const elem = document.createElement('div');
			elem.classList.add('Candidates__val');
			elem.innerHTML = this.exportShapeToSvg(v);
			elem.addEventListener('mousedown', ev => {
				ev.preventDefault();
				ev.stopPropagation();
			});
			elem.addEventListener('mouseup', ev => {
				ev.preventDefault();
				ev.stopPropagation();

				if(this.answer) {
					return;
				}

				const isCorrect = this.candidates[i].every((polygon, i2) => {
					return polygon.every((point, i3) => {
						return point.equals(this.obstaclePolygon[i2][i3]);
					});
				});

				if(isCorrect) this.answer = 'correct';
				else this.answer = 'wrong';

				this.handleAnswer();
			});

			candidates.appendChild(elem);
		});
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

		document.addEventListener('keydown', ({key}) => {
			if(key === ' ' && this.answer) {
				this.newQuestion();
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

		if(!this.answer) this.renderBlind();

		this.deathNote.forEach(e => {
			e.setDead();
			if(this.obstacles.includes(e)) {
				this.obstacles.splice(this.obstacles.indexOf(e), 1);
			}
			delete this.entities[e.entityId];
		});
		this.deathNote = [];

		setTimeout(this.updateBound, 20);
	}

	finishDrag() {
		this.drag = false;

		if(!this.dragEnd || this.dragEnd.equals(this.dragStart)) return;

		const electron = new EntityElectron(this, this.dragStart.clone(), 10);
		electron.motion = this.dragEnd.clone().subtract(this.dragStart).normalize().multiply(4);

		this.spawn(electron);
	}

	render() {
		this.ctx.fillStyle = '#f1f2f3';
		this.ctx.fillRect(0, 0, this.width, this.height);

		if(this.drag && this.dragEnd) {
			const dragVector = this.dragEnd
				.clone()
				.subtract(this.dragStart)
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

	renderBlind() {
		this.ctx.fillStyle = '#e1e2e3';
		this.ctx.fillRect(this.width / 2 - 100, this.height / 2 - 100, 200, 200);

		this.ctx.fillStyle = '#202020';
		this.ctx.font = '40px Gothic A1';
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		this.ctx.fillText('?', this.width / 2, this.height / 2);
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

	newQuestion() {
		this.answer = undefined;
		this.obstacles.forEach(v => this.despawn(v));
		this.obstaclePolygon = this.candidates[Math.floor(Math.random() * this.candidates.length)];
		this.initObstacle(this.obstaclePolygon);
	}

	exportShapeToSvg(polygons, size=150) {
		let exportData = `<svg width="${size}" height="${size}">`;
		polygons.forEach(polygon => {
			const start = polygon[polygon.length - 1];
			const offset = size / 2;

			exportData += `<path d="M${offset + start.x},${offset + start.y} `;

			polygon.forEach(position => {
				exportData += `L${offset + position.x},${offset + position.y} `;
			});

			exportData += '" fill="#e91e63"/>';
		});

		return exportData + "</svg>";
	}

	handleAnswer() {
		const app = document.querySelector('.App');
		const alertContainer = document.createElement('div');
		alertContainer.classList.add('Alert');

		if(this.answer === 'correct') {
			alertContainer.innerText = '○ 정답입니다!';
		} else {
			alertContainer.innerText = '× 틀렸습니다.';
		}

		app.appendChild(alertContainer);

		setTimeout(() => alertContainer.classList.add('Alert--shown'), 10);
		setTimeout(() => alertContainer.classList.remove('Alert--shown'), 2000);
		setTimeout(() => app.removeChild(alertContainer), 3000);
	}

	toggleUi() {
		const app = document.querySelector('.App');
		if(app.classList.contains('App--hidden')) {
			app.classList.remove('App--hidden');
		} else {
			app.classList.add('App--hidden');
		}
	}
}

export default Game;
