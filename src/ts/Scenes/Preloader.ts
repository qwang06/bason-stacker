import SplashScreen from "./SplashScreen";
import MainGame from "./MainGame";
import MainMenu from "./MainMenu";
import Utilities from "../Utilities";

export default class Preloader extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "Preloader";

	public preload(): void {
		this.addProgressBar();

		this.load.path = "assets/";

		// fonts
		this.load.bitmapFont("arcade", "fonts/arcade.png", "fonts/arcade.xml");

		// images
		this.load.image("cult_underground2");
		this.load.image("BG");
		this.load.image("bason_cave_lw3");
		this.load.image("FINAL_CAMPSCENE");
		this.load.image("coin", "front_coin_flat.png");
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("Preloader", "create");

		// this.scene.start(SplashScreen.Name);
		this.scene.start(MainGame.Name);
		// this.scene.start(MainMenu.Name);
	}

	public update(): void {
		// preload handles updates to the progress bar, so nothing should be needed here.
	}

	/**
	 * Adds a progress bar to the display, showing the percentage of assets loaded and their name.
	 */
	private addProgressBar(): void {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;
		/** Customizable. This text color will be used around the progress bar. */
		const outerTextColor = "#ffffff";

		const progressBar = this.add.graphics();
		const progressBox = this.add.graphics();
		progressBox.fillStyle(0x222222, 0.8);
		progressBox.fillRect(width / 4, height / 2 - 30, width / 2, 50);

		const loadingText = this.make.text({
			x: width / 2,
			y: height / 2 - 50,
			text: "Loading...",
			style: {
				fontFamily: "VT323, monospace",
				fontSize: "20px",
				color: outerTextColor,
			},
		});
		loadingText.setOrigin(0.5, 0.5);

		const percentText = this.make.text({
			x: width / 2,
			y: height / 2 - 5,
			text: "0%",
			style: {
				fontFamily: "VT323, monospace",
				fontSize: "18px",
				color: "#ffffff",
			},
		});
		percentText.setOrigin(0.5, 0.5);

		const assetText = this.make.text({
			x: width / 2,
			y: height / 2 + 50,
			text: "",
			style: {
				fontFamily: "VT323, monospace",
				fontSize: "18px",
				color: outerTextColor,
			},
		});

		assetText.setOrigin(0.5, 0.5);

		this.load.on("progress", (value: number) => {
			percentText.setText(parseInt(value * 100 + "", 10) + "%");
			progressBar.clear();
			progressBar.fillStyle(0xffffff, 1);
			progressBar.fillRect(
				width / 4 + 10,
				height / 2 - 30 + 10,
				(width / 2 - 10 - 10) * value,
				30
			);
		});

		this.load.on("fileprogress", (file: Phaser.Loader.File) => {
			assetText.setText("Loading asset: " + file.key);
		});

		this.load.on("complete", () => {
			progressBar.destroy();
			progressBox.destroy();
			loadingText.destroy();
			percentText.destroy();
			assetText.destroy();
		});
	}
}
