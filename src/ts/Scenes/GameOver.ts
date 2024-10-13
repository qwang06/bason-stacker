import MainGame from "./MainGame";

// Create game over scene
export default class GameOver extends Phaser.Scene {
	public static Name = "GameOver";
	overlay: Phaser.GameObjects.Rectangle;
	score: number;

	public create({ score }): void {
		// this.scene.pause();
		this.score = score;

		this.setupUI();
	}

	setupUI() {
		// create a faded overlay over entire screen
		this.overlay = this.add
			.rectangle(
				0,
				0,
				this.cameras.main.width,
				this.cameras.main.height,
				0x000000,
				0.5
			)
			.setOrigin(0, 0);

		// add game over text to center of screen
		const text = this.add
			.text(this.cameras.main.centerX, this.cameras.main.centerY, "Game Over", {
				fontSize: "40px",
				color: "#ffffff",
				fontFamily: "VT323, monospace",
			})
			.setOrigin(0.5);
		// add score to above game over text
		const scoreText = this.add
			.text(
				this.cameras.main.centerX,
				this.cameras.main.centerY - 50,
				`Score: ${this.score}`,
				{
					fontSize: "20px",
					color: "#ffffff",
					fontFamily: "VT323, monospace",
				}
			)
			.setOrigin(0.5);

		// add text to restart game
		const restartText = this.add
			.text(
				this.cameras.main.centerX,
				this.cameras.main.centerY + 50,
				"Restart",
				{
					fontSize: "40px",
					color: "#ffffff",
					fontFamily: "VT323, monospace",
				}
			)
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		// add click event to restart game
		restartText.on("pointerdown", () => {
			console.log("Restarting game");
			this.scene.start(MainGame.Name);
			this.scene.stop(GameOver.Name);
		});

		// on hover change color of text
		restartText.on("pointerover", () => {
			restartText.setColor("#00ffff");
		});

		// on hover out change color of text back to white
		restartText.on("pointerout", () => {
			restartText.setColor("#ffffff");
		});
	}
}
