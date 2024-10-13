import "phaser";
import Boot from "./Scenes/Boot";
import Preloader from "./Scenes/Preloader";
import MainMenu from "./Scenes/MainMenu";
import SplashScreen from "./Scenes/SplashScreen";
import Utilities from "./Utilities";
import MainGame from "./Scenes/MainGame";
import MainSettings from "./Scenes/MainSettings";
import UI from "./Scenes/UI";
import GameOver from "./Scenes/GameOver";

const gameConfig: Phaser.Types.Core.GameConfig = {
	width: 375,
	height: 600,
	type: Phaser.AUTO,
	parent: "content",
	title: "Bason Stacker",
	physics: {
		default: "arcade",
		arcade: {
			gravity: { x: 0, y: 300 },
		},
	},
	render: {
		pixelArt: false,
	},
};

export default class Game extends Phaser.Game {
	constructor(config: Phaser.Types.Core.GameConfig) {
		Utilities.LogSceneMethodEntry("Game", "constructor");

		super(config);

		this.scene.add(Boot.Name, Boot);
		this.scene.add(Preloader.Name, Preloader);
		this.scene.add(SplashScreen.Name, SplashScreen);
		this.scene.add(MainMenu.Name, MainMenu);
		this.scene.add(MainGame.Name, MainGame);
		this.scene.add(MainSettings.Name, MainSettings);
		this.scene.add(UI.Name, UI);
		this.scene.add(GameOver.Name, GameOver);
		this.scene.start(Boot.Name);
	}
}

window.onload = (): void => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const game = new Game(gameConfig);
};
