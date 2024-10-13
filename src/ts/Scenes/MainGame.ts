import Utilities from "../Utilities";
import UI from "./UI";
import GameOver from "./GameOver";
import Coin from "../Coin";
import events from "../Events";

const COIN_SPACING = 0; // spacing between coins so they don't overlap
const COIN_SPEED = 300; // speed at which coins move
const NUM_ROWS_BEFORE_SCROLL = 3; // number of rows before scrolling effect is triggered
// when the map is "scrolling", the coins may not line up perfectly with the grid
// this constant is the maximum difference in y position between coins that are considered to be in the same column
const POTENTIAL_MOVING_DIFFERENCE = 10;

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";
	movingCoins: Phaser.Physics.Arcade.Image[];
	stackedCoins: Phaser.Physics.Arcade.Image[];
	bottomCoins: Phaser.Physics.Arcade.Image[];
	coinsToSpawn: number;
	timesStacked: number;
	backgrounds: Phaser.GameObjects.Image[];
	currentBgIndex: number;

	public init(): void {
		this.movingCoins = [];
		this.stackedCoins = [];
		this.bottomCoins = [];
		this.coinsToSpawn = 3;
		this.timesStacked = 0;
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		this.scene.launch(UI.Name);
		this.setupBackground();
		this.setupCoins();
		this.setupClickEvents();
	}

	public update(): void {
		let topStackedCoin;
		// coins should be kept in a grid formation that starts at the bottom of the screen
		// row 0 is the bottom row and its y position is the height of the screen minus the height of a coin
		// row 1 is the row above row 0 and its y position is the y position of row 0 minus the height of a coin
		this.stackedCoins.forEach((coin) => {
			// keep coins from moving when they hit the ground or other coins
			if (coin.body.velocity.y === 0) {
				coin.y = Math.round(coin.y);
				// fix coin y positions to grid
				const row = Math.round(
					(this.cameras.main.height - coin.y) / coin.displayHeight
				);
				coin.y = Math.round(
					this.cameras.main.height - row * coin.displayHeight
				);
			}

			if (!topStackedCoin || coin.y < topStackedCoin.y) {
				topStackedCoin = coin;
			}
		});

		if (this.movingCoins.length) {
			const firstCoin = this.movingCoins[0];
			this.movingCoins.forEach((coin, index) => {
				// sync moving coins' x position with the first coin in the moving coins array
				coin.x = firstCoin.x + (coin.displayWidth + COIN_SPACING) * index;
				// sync moving coins' y position to always be above the top stacked coin
				if (topStackedCoin) {
					coin.setVelocityY(0);
					console.log(topStackedCoin.y, coin.y);
					coin.y = Math.round(topStackedCoin.y - coin.displayHeight);
					console.log(topStackedCoin.y, coin.y);
				}
			});
		}
	}

	checkBoundaries(body, up, down, left, right) {
		if (left || right) {
			this.movingCoins.forEach((coin) => {
				coin.setVelocityX(COIN_SPEED * (left ? 1 : -1));
			});
		}
	}

	setupBackground() {
		const cameraWidth = this.cameras.main.width;
		const cameraHeight = this.cameras.main.height;

		this.physics.world.bounds.width = cameraWidth;
		this.physics.world.bounds.height = cameraHeight;

		// add sticky background image to scene
		const bg = this.add.image(0, 0, "BG").setOrigin(0);
		// scale background image to fit screen
		bg.setScale(Math.max(cameraWidth / bg.width, cameraHeight / bg.height));
		bg.x = 0 - (bg.displayWidth - cameraWidth) / 2;
		bg.setScrollFactor(0, 1);

		// add background image to scene
		const bg2 = this.add.image(0, 0, "cult_underground2").setOrigin(0);
		// scale background image to fit screen
		bg2.setScale(Math.max(cameraWidth / bg2.width, cameraHeight / bg2.height));
		bg2.x = 0 - (bg2.displayWidth - cameraWidth) / 2;
		bg2.setScrollFactor(0, 1);

		const bg3 = this.add.image(0, 0, "bason_cave_lw3").setOrigin(0);
		// scale background image to fit screen
		bg3.setScale(Math.max(cameraWidth / bg3.width, cameraHeight / bg3.height));
		bg3.x = 0 - (bg3.displayWidth - cameraWidth) / 2;
		// set background image to out of view
		bg3.y = this.cameras.main.height;
		bg3.setScrollFactor(0, 1);

		const bg4 = this.add.image(0, 0, "FINAL_CAMPSCENE").setOrigin(0);
		// scale background image to fit screen
		bg4.setScale(Math.max(cameraWidth / bg4.width, cameraHeight / bg4.height));
		bg4.x = 0 - (bg4.displayWidth - cameraWidth) / 2;
		// set background image to out of view
		bg4.y = this.cameras.main.height;
		bg4.setScrollFactor(0, 1);

		this.backgrounds = [bg2, bg3, bg4];
		this.currentBgIndex = 0;
	}

	setupClickEvents() {
		this.input.on("pointerdown", this.coinsStack.bind(this));
		this.physics.world.on("worldbounds", this.checkBoundaries.bind(this));
	}

	setupCoins() {
		this.spawnNewCoins();
	}

	coinsStack() {
		// stop all coins from moving
		const firstCoin = this.movingCoins[0];
		const offset = firstCoin.x % firstCoin.displayWidth;
		const left = offset < firstCoin.displayWidth / 2;
		const direction = firstCoin.body.velocity.x > 0 ? "right" : "left";
		let stacked = 0;

		this.movingCoins.forEach((coin) => {
			coin.setVelocity(0, 0);
			coin.x = coin.x - (left ? offset : offset - coin.displayWidth);
			coin.y = Math.round(coin.y);

			// check if there is a stacked coin below coin with POTENTIAL_MOVING_DIFFERENCE
			const coinBelow = this.stackedCoins.find((stackedCoin) => {
				console.log({
					y: coin.y,
					stackedY: stackedCoin.y,
					diff: Math.abs(coin.y + coin.displayWidth - stackedCoin.y),
				});
				return (
					coin.x === stackedCoin.x &&
					Math.abs(coin.y + coin.displayWidth - stackedCoin.y) <
						POTENTIAL_MOVING_DIFFERENCE
				);
			});
			if (coinBelow) {
				stacked++;
			}
		});
		const willOverflow =
			firstCoin.x + firstCoin.displayWidth * this.movingCoins.length >
			this.cameras.main.width;
		if (willOverflow) {
			// remove world bounds collision from overflowed coin
			const lastCoin = this.movingCoins[this.movingCoins.length - 1];
			// TODO: better solution for how to handle coins that overflow
			lastCoin.x = this.cameras.main.width - lastCoin.displayWidth / 2;
			lastCoin.setCollideWorldBounds(false);
		}

		if (this.stackedCoins.length) {
			this.coinsToSpawn = stacked;

			if (stacked > 0) {
				this.timesStacked++;
			}
		} else {
			this.timesStacked++;
		}

		// only collide with stacked coins when falling down
		this.physics.add.collider(
			this.movingCoins,
			this.stackedCoins,
			(obj1: any, obj2: any) => {
				obj1.setVelocityY(0);
				obj2.setVelocityY(0);
			}
		);

		// add all moving coins to stacked coins array
		this.stackedCoins.push(...this.movingCoins);
		// clear moving coins array
		this.movingCoins = [];
		// spawn new coins
		this.spawnNewCoins(firstCoin.x, direction);
		// update score
		events.emit("coinStacked", this.timesStacked);
		if (this.timesStacked > NUM_ROWS_BEFORE_SCROLL) {
			this.simulateScrolling();
		}
	}

	// handles logic for spawning new coins
	spawnNewCoins(x = 0, direction = "right") {
		if (this.coinsToSpawn === 0) {
			console.log("game over");
			this.scene.launch(GameOver.Name, { score: this.timesStacked });
			this.scene.pause();
			return;
		}

		let yPosToSpawn: number;

		if (this.stackedCoins.length) {
			// get the last coin in the stacked coins array
			const lastCoin = this.stackedCoins[this.stackedCoins.length - 1];
			// get the y position of the last coin
			yPosToSpawn = lastCoin.y - lastCoin.displayHeight;
		}

		for (let i = 0; i < this.coinsToSpawn; i++) {
			const coin = new Coin(this, 0, 0, true);
			coin.x = i * (coin.displayWidth + COIN_SPACING) + x;
			if (yPosToSpawn) {
				coin.y = yPosToSpawn;
			} else {
				coin.y = this.cameras.main.height - coin.displayHeight;
			}
			this.movingCoins.push(coin);
		}

		this.movingCoins.forEach((coin) => {
			coin.setVelocityX(COIN_SPEED * (direction === "right" ? 1 : -1));
		});

		// set collision between coins in moving coins array
		// this.movingCoins.forEach((coin) => {
		// 	this.movingCoins.forEach((otherCoin) => {
		// 		if (coin !== otherCoin) {
		// 			this.physics.add.collider(coin, otherCoin);
		// 		}
		// 	});
		// });
	}

	// simulate scrolling effect by moving all coins down
	// coins at the bottom of the screen are removed
	simulateScrolling() {
		// find all coins that are at the bottom of the screen
		this.bottomCoins = this.stackedCoins.filter((coin) => {
			return (
				Math.round(coin.y + coin.displayHeight) === this.cameras.main.height
			);
		});
		if (!this.bottomCoins.length) {
			return;
		}

		// remove collision with world bounds
		this.bottomCoins.forEach((coinToScroll) => {
			coinToScroll.setCollideWorldBounds(false);
		});

		// move background image down by the height of a coin with tween
		const bg = this.backgrounds[this.currentBgIndex];
		const coinHeight = this.bottomCoins[0].displayHeight;
		const scrollDuration = 300;
		const scrollY = coinHeight;
		this.add.tween({
			targets: bg,
			y: bg.y + scrollY,
			duration: scrollDuration,
			ease: "Linear",
			onComplete: () => {
				// remove coins that are at the bottom of the screen
				this.bottomCoins.forEach((coinToScroll) => {
					this.stackedCoins = this.stackedCoins.filter((coin) => {
						return coin !== coinToScroll;
					});
					coinToScroll.destroy();
				});
			},
		});

		// if current background image is at the bottom of the screen, show next background image
		if (bg.y >= this.cameras.main.height) {
			this.currentBgIndex++;
			this.backgrounds[this.currentBgIndex].y = 0;
		}
	}
}
