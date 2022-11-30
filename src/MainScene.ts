import Phaser, { GameObjects } from "phaser";

/**
 * メインゲーム画面制御クラス
 */
class MainScene extends Phaser.Scene {
  private latestJam?: Phaser.Physics.Matter.Image;
  private stopCounter = 0;
  private canAdd = false;
  private jamFallStartY = 0;
  private lastLatestJamPositionY = 0;
  private canvasWidth = 0;
  private canvasHeight = 0;
  private currentHeight = 0;
  private cursorJam?: GameObjects.Image;
  private isGameEnd = false;
  private score = 0;
  private scoreText?: GameObjects.Text;

  private seBgm?: Phaser.Sound.BaseSound;
  private seFall?: Phaser.Sound.BaseSound;
  private seLanding?: Phaser.Sound.BaseSound;
  private seStart?: Phaser.Sound.BaseSound;
  private seEnd?: Phaser.Sound.BaseSound;

  /**
   * コンストラクタ
   */
  constructor() {
    super("mainScene");
  }

  /**
   * リソースの事前読み込み
   */
  preload() {
    //画像リソース読み込み
    this.load.image("jam1", "/image/jam.png");
    this.load.image("background", "/image/background.jpg");
    this.load.image("ground", "/image/ground.jpg");
    this.load.image("shock", "/image/shock.png");
    //効果音リソース読み込み
    this.load.audio("bgm", "/se/zangyousenshi.mp3");
    this.load.audio("fall", "/se/tm2_bom002.wav");
    this.load.audio("landing", "/se/tm2_bom001.wav");
    this.load.audio("end", "/se/voice012.wav");
    this.load.audio("start", "/se/bell00.wav");

    //カメラのフェードイン実行
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  /**
   * ゲーム開始
   */
  public start() {
    this.score = 0;
    this.stopCounter = 0;
    this.jamFallStartY = 0;
    this.canAdd = true;
    this.isGameEnd = false;
    this.lastLatestJamPositionY = 0;
    this.currentHeight = this.canvasHeight + 10;
    this.cursorJam?.setVisible(true);
    this.cursorJam?.setY(0);
    this.viewScoreText();

    (this.sound as Phaser.Sound.HTML5AudioSoundManager).unlock();
    this.seBgm?.play();
  }

  /**
   * シーン生成
   */
  create() {
    this.seBgm = this.sound.add("bgm", {
      volume: 0.5,
      loop: true,
    });
    this.seFall = this.sound.add("fall");
    this.seLanding = this.sound.add("landing");
    this.seEnd = this.sound.add("end");
    this.seStart = this.sound.add("start");
    this.canvasWidth = this.sys.game.canvas.width;
    this.canvasHeight = this.sys.game.canvas.height;
    //背景を位置固定で表示
    const background = this.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setScrollFactor(0);
    background.displayWidth = this.canvasWidth;
    background.displayHeight = this.canvasHeight;

    this.cursorJam = this.add
      .image(0, this.jamFallStartY, "jam1")
      .setAlpha(0.5);
    this.tweens.timeline({
      targets: this.cursorJam,
      duration: 1500,
      tweens: [
        {
          x: this.canvasWidth,
        },
        {
          x: 0,
        },
      ],
      loop: -1,
    });

    /**
     * ジャムを落下させる
     * @param x 落下時のX座標
     */
    const addJam = (x: number) => {
      this.seFall?.play();
      this.stopCounter = 0;
      this.canAdd = false;
      const jam = this.matter.add.image(
        x,
        this.jamFallStartY,
        "jam1",
        undefined,
        {
          density: 0.005,
          frictionAir: 0.05,
        }
      );
      jam.setRectangle(160, 170);
      jam.setBounce(0.9);
      this.latestJam = jam;
      this.cursorJam?.setVisible(false);
    };
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!this.canAdd) {
        return;
      }
      addJam(this.cursorJam!.x);
    });

    //地面を追加
    this.matter.add.image(
      this.canvasWidth / 2,
      this.canvasHeight - 10,
      "ground",
      undefined,
      { isStatic: true }
    );

    //スコア表示
    this.scoreText = this.add
      .text(20, this.canvasHeight - 60, "")
      .setFont("32px Arial")
      .setColor("#d7fcfe")
      .setStroke("#2d2d2d", 16)
      .setDepth(99999)
      .setShadow(2, 2, "#000000", 4, true, false)
      .setScrollFactor(0);
    this.viewScoreText();

    this.matter.world.on(
      "collisionstart",
      (event: Event, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
        if (bodyB.gameObject === this.latestJam) {
          this.seLanding?.play();
        }
      }
    );
    this.start();
  }

  /**
   * カメラの位置制御
   * @param callback 位置移動完了後の処理
   */
  moveCamera(callback: Function) {
    const topJamPositionY: number = this.latestJam?.body.position.y!;
    if (topJamPositionY - this.jamFallStartY > 400) {
      callback();
      return;
    }
    //最上段のジャムの位置が画面上部に近付いてきたら、カメラの位置をずらす
    this.jamFallStartY -= this.canvasHeight;
    const nextCameraPositionY = topJamPositionY - this.canvasHeight / 2;
    this.jamFallStartY = nextCameraPositionY - this.canvasHeight / 2;
    this.cursorJam?.setY(this.jamFallStartY);
    this.cameras.main.pan(
      this.cameras.main.centerX,
      topJamPositionY - this.canvasHeight / 2,
      1000,
      "Linear",
      false,
      (camera: Phaser.Cameras.Scene2D.Camera, progress: number, x, y) => {
        if (progress === 1) {
          callback();
        }
      }
    );
  }

  /**
   * ゲーム終了後の結果ダイアログ表示
   */
  endGame(): void {
    const scoreText = String(this.score);
    const message = `ジャムを${scoreText}メートル積み上げた!!`;
    const encodedText = encodeURI(message) + "%0A";
    document
      .getElementById("btn-tweet")!
      .setAttribute(
        "href",
        `https://twitter.com/intent/tweet?text=${encodedText}&url=https%3A%2F%2Fjamstack-higher.vercel.app&hashtags=JAM%E3%82%92STACK`
      );
    document.getElementById("result-message")!.textContent = String(this.score);
    document.getElementById("result-wrapper")!.classList.remove("hidden");
  }

  /**
   * フレーム更新時に毎回実行する処理
   * @param time このシーンを開始してからの経過時間
   * @param delta 前回のフレーム更新からの経過時間
   */
  update(time: number, delta: number): void {
    if (!this.latestJam || this.isGameEnd) {
      return;
    }

    /**
     * ゲーム終了の表示
     */
    const end = () => {
      this.seEnd?.play();
      this.isGameEnd = true;
      this.add
        .image(this.canvasWidth / 2, this.canvasHeight / 2, "shock")
        .setScrollFactor(0)
        .setDepth(99999)
        .setVisible(true);
      setTimeout(() => {
        this.endGame();
      }, 3000);
    };

    //最後に投下したジャムの位置が、投下完了時より下にあったらタワーが崩れたとみなしてゲーム終了とする
    if (this.latestJam?.body?.position.y > this.currentHeight + 50) {
      end();
      return;
    }
    if (this.canAdd) {
      return;
    }
    //静止判定
    const body = this.latestJam.body;
    const isResting =
      Math.abs(this.lastLatestJamPositionY - body.position.y) < 1.0;
    this.lastLatestJamPositionY = body.position.y;
    if (!isResting) {
      this.stopCounter = 0;
    } else {
      this.stopCounter++;
    }
    if (this.stopCounter === 10) {
      this.moveCamera(() => {
        if (this.currentHeight - 50 < this.latestJam?.body.position.y!) {
          //ジャムの着地位置が、最後に投下したジャムの上でなかった場合、ゲーム終了とする
          end();
          return;
        }
        this.canAdd = true;
        this.cursorJam?.setVisible(true);
        this.currentHeight = this.latestJam?.body.position.y!;
        this.score++;
        this.viewScoreText();
      });
    }
  }
  /**
   * スコア表示更新
   */
  viewScoreText() {
    this.scoreText?.setText(`高さ: ${this.score} メートル`);
  }

  /**
   * 再チャレンジ
   */
  restart() {
    this.seStart?.play();
    this.seBgm?.stop();
    this.scene.restart();
  }
}

export default MainScene;
