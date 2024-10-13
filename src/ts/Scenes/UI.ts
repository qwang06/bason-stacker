import events from "../Events";
import Utilities from "../Utilities";

export default class UI extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "UI";
	panel: Phaser.GameObjects.Rectangle;
	scoreText: Phaser.GameObjects.Text;

	public create(): void {
		Utilities.LogSceneMethodEntry("UI", "create");
		this.setupUI();
		this.setupisteners();
		this.scene.pause();
	}

	setupUI() {
		const x = 10;
		const y = 10;
		const width = 125;
		const height = 40;
		const bgColor = 0xffffff;
		// create a rectangle with black border, white background with 0.5 alpha, and rounded corners
		this.panel = this.add
			.rectangle(x, y, width, height, bgColor, 0.5)
			.setOrigin(0, 0)
			.setStrokeStyle(2, 0x000000);
		// add text to the panel
		this.scoreText = this.add.text(x + 10, y + 10, "Score: 0", {
			fontSize: "20px",
			color: "#000000",
			fontFamily: "VT323, monospace",
		});
	}

	setupisteners() {
		events.on("coinStacked", this.updateScore, this);
	}

	updateScore(score: number) {
		this.scoreText.setText(`Score: ${score}`);
	}
}
