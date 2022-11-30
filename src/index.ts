import MainScene from "./MainScene";
import TitleScene from "./TitleScene";

window.onload = () => {
  const canvasWidth = 640;
  const canvasHeight = 1336;

  //ゲーム起動設定
  const config: Phaser.Types.Core.GameConfig = {
    parent: "canvas-parent",
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
    backgroundColor: "#4488aa",
    physics: {
      default: "matter",
      matter: {
        debug: false,
        gravity: { y: 0.9 },
      },
    },
    audio: {
      disableWebAudio: true,
    },
    scene: [TitleScene, MainScene],
    fps: {
      target: 60,
      forceSetTimeOut: true,
    },
  };
  //ゲーム起動
  const game = new Phaser.Game(config);

  //再挑戦ボタン押下時の処理
  document.getElementById("btn-restart")!.addEventListener("click", () => {
    const mainScene: MainScene = game.scene.getScene("mainScene") as MainScene;
    mainScene.cameras.main.fadeOut(500, 0, 0, 0);
    mainScene.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        document.getElementById("result-wrapper")!.classList.add("hidden");
        mainScene.restart();
      }
    );
  });
};
