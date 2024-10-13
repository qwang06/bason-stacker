export class Coin extends Phaser.Physics.Arcade.Image {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		collideWorldBounds: boolean
	) {
		super(scene, x, y, "coin");
		this.setScale(0.15);
		scene.physics.add.existing(this);
		scene.add.existing(this);
		// this.setVelocity(300, 100);
		// this.setBounce(1, 0);
		if (collideWorldBounds) {
			this.setCollideWorldBounds(true, 0, 0, true);
		} else {
			this.setCollideWorldBounds(false);
		}
		this.setOrigin(0);
		this.setGravityY(0);
	}
}

export default Coin;
