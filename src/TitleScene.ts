import Phaser from "phaser";

/**
 * タイトル画面制御クラス
 */
class TitleScene extends Phaser.Scene {
  /**
   * コンストラクタ
   */
  constructor() {
    super("titleScene");
  }

  /**
   * リソースの事前読み込み
   */
  preload() {
    //画像リソース読み込み
    this.load.image("jam", "/image/jam.png");
    this.load.image("title", "/image/title.png");
    this.load.image("start", "/image/startButton.png");
    //効果音リソース読み込み
    this.load.audio("start", "/se/bell00.wav");
  }

  /**
   * シーン生成
   */
  create() {
    const canvasWidth = this.sys.game.canvas.width;
    const canvasHeight = this.sys.game.canvas.height;
    this.add.image(canvasWidth / 2, 200, "title");
    this.add.image(canvasWidth / 2, canvasHeight / 2 - 100, "jam").scale = 2;
    this.add
      .text(
        canvasWidth / 2,
        canvasHeight / 2 + 200,
        "タイミング良く画面をタップして\nジャムを空高く積み上げろ！\n崩れたら全てが終わりだ！"
      )
      .setFont("32px Arial")
      .setColor("white")
      .setAlign("center")
      .setLineSpacing(10)
      .setOrigin(0.5, 0.5);

    const startSE = this.sound.add("start");
    this.add
      .image(canvasWidth / 2, canvasHeight / 2 + 350, "start")
      .setInteractive({ useHandCursor: true })
      .addListener("pointerup", () => {
        (this.sound as Phaser.Sound.HTML5AudioSoundManager).unlock();
        startSE.play();
        this.startGame();
      });
    this.add
      .text(canvasWidth / 2, canvasHeight / 2 + 440, "(※音が鳴ります)")
      .setFont("32px Arial")
      .setColor("white")
      .setLineSpacing(10)
      .setOrigin(0.5, 0.5);

    this.add
      .text(canvasWidth / 2, canvasHeight - 120, "© 2022  @de_teiu_tkg")
      .setFont("32px Arial")
      .setColor("#fff8c7")
      .setLineSpacing(10)
      .setOrigin(0.5, 0.5)
      .setInteractive({
        useHandCursor: true,
      })
      .addListener("pointerup", () => {
        window.open("https://twitter.com/de_teiu_tkg", "_blank");
      });

    this.add
      .text(canvasWidth - 200, canvasHeight - 20, "BGM素材:")
      .setFont("24px Arial")
      .setColor("white")
      .setLineSpacing(10)
      .setOrigin(1, 0.5);
    this.add
      .text(canvasWidth - 20, canvasHeight - 20, "甘茶の音楽工房")
      .setFont("24px Arial")
      .setColor("#fff8c7")
      .setLineSpacing(10)
      .setOrigin(1, 0.5)
      .setInteractive({
        useHandCursor: true,
      })
      .addListener("pointerup", () => {
        window.open("https://amachamusic.chagasi.com/", "_blank");
      });
  }

  /**
   * メインゲーム画面に遷移
   */
  startGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start("mainScene");
      }
    );
  }
}

export default TitleScene;
