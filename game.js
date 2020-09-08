import {
  init,
  Sprite,
  GameLoop,
  initKeys,
  keyPressed,
  Text,
  Scene,
  collides,
  Grid,
  keyMap,
  getStoreItem,
  setStoreItem,
  randInt,
  load,
  imageAssets,
  SpriteSheet,
  audioAssets,
} from "kontra";

import { textOptions, getRandomLetter, getRandomTunnelColor } from "./utils.js";

const currentKeysDefault = { up: "w", down: "s", count: 100 };
async function main() {
  let { canvas } = init();
  let currentGameState = "menu"; // menu, started, ended

  let currentTunnelWidth = 500;
  let currentTunnelY = canvas.height / 2;
  let currentKeys = { ...currentKeysDefault };
  let tunnelBits = [];
  let rocks = [];
  let score = 0;

  await load(
    "assets/ship2.png",
    "assets/explosion.wav",
    "assets/change.wav",
    "assets/ship-sprite.png"
  );

  function resetGame() {
    currentTunnelWidth = 500;
    currentTunnelY = canvas.height / 2;
    currentKeys = { ...currentKeysDefault };
    tunnelBits = [];
    rocks = [];
    score = 0;
    createTunnelBitTopBottom(currentTunnelWidth, currentTunnelY);
    currentGameState = "menu";
  }

  let logo = Sprite({
    width: 50,
    height: 20,
    anchor: { x: 0.5, y: 0.5 },
    image: imageAssets["assets/ship2.png"],
  });

  let help = Text({
    text:
      "How to play: Normal controls are not found.\nUse the keys displayed in the bottom left for control.",
    color: "white",
    font: "16px Arial, sans-serif",
    textAlign: "center",
  });

  let start = Text({
    text: "Hit the spacebar to start",
    ...textOptions,
  });

  let highScore = Text({
    text: "Highest Score: 0",
    ...textOptions,
  });

  let lastScore = Text({
    text: "Last Score: 0",
    ...textOptions,
  });

  let menu = Grid({
    x: canvas.width / 2,
    y: canvas.height / 2,
    anchor: { x: 0.5, y: 0.5 },
    rowGap: 15,
    justify: "center",
    children: [logo, start, help, highScore, lastScore],
  });

  let menuScene = Scene({
    id: "menu",
    onShow() {
      console.log("menu showed");
    },
    children: [menu],
  });

  function createRandomRock(y) {
    let rock = Sprite({
      x: canvas.width,
      y: y,
      dx: -2,
      color: getRandomTunnelColor(),
      height: 20,
      width: 20,
      anchor: { x: 0.5, y: 0.5 },
    });
    rocks.push(rock);
  }

  function createTunnelBit(y, top) {
    let tunnelBit = Sprite({
      x: canvas.width,
      y,
      dx: -2,
      color: getRandomTunnelColor(),
      height: canvas.height / 2,
      width: 2,
      anchor: { x: 0.5, y: top ? 0 : 1 },
    });
    tunnelBits.push(tunnelBit);
  }

  function createTunnelBitTopBottom(width, y) {
    // top
    createTunnelBit(y + width / 2, true);
    // bottom
    createTunnelBit(y - width / 2, false);
  }

  let spriteSheet = SpriteSheet({
    image: imageAssets["assets/ship-sprite.png"],
    frameWidth: 50,
    frameHeight: 20,
    animations: {
      walk: {
        frames: "0..3",
        frameRate: 30,
      },
    },
  });

  let ship = Sprite({
    x: canvas.width / 4,
    y: canvas.height / 2,
    // color: "blue",
    width: 50,
    height: 20,
    anchor: { x: 0, y: 0.5 },
    // image: imageAssets['assets/ship2.png'],
    animations: spriteSheet.animations,
  });

  let upKeyText = Text({
    text: currentKeys.up.toUpperCase(),
    ...textOptions,
    x: 40,
    y: canvas.height - 80,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: "center",
  });

  let upKeyIcon = Text({
    text: "↑",
    ...textOptions,
    font: "25px Arial, sans-serif",
    x: 40,
    y: canvas.height - 60,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: "center",
  });

  let downKeyText = Text({
    text: currentKeys.down.toUpperCase(),
    ...textOptions,
    x: 40,
    y: canvas.height - 15,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: "center",
  });

  let downKeyIcon = Text({
    text: "↓",
    ...textOptions,
    font: "25px Arial, sans-serif",
    x: 40,
    y: canvas.height - 40,
    anchor: { x: 0.5, y: 0.5 },
    textAlign: "center",
  });

  let errorText = Text({
    text: "",
    ...textOptions,
    x: 80,
    y: canvas.height - 50,
    anchor: { x: 0, y: 0.5 },
    textAlign: "center",
  });

  let scoreText = Text({
    text: "Score: 0",
    ...textOptions,
    x: canvas.width - 10,
    y: canvas.height - 20,
    anchor: { x: 1, y: 0.5 },
    textAlign: "center",
  });

  let controls = Scene({
    id: "display",
    children: [upKeyText, downKeyText, errorText, upKeyIcon, downKeyIcon],
    update: function() {
      // console.log('jello')
    },
  });

  initKeys();

  // start tunnel
  // createTunnelBit(canvas.height/4)
  createTunnelBitTopBottom(currentTunnelWidth, currentTunnelY);

  let loop = GameLoop({
    // create the main game loop
    update: function() {
      // update the game state
      if (currentGameState === "menu") {
        highScore.text = `Highest Score: ${
          getStoreItem("score") ? getStoreItem("score") : 0
        }`;
        lastScore.text = `Last Score: ${
          getStoreItem("lastscore") ? getStoreItem("lastscore") : 0
        }`;
      }

      if (keyPressed("space") && currentGameState === "menu") {
        ship.y = canvas.height / 2;
        currentGameState = "started";
        return;
      }

      // TODO: move out into own scenes
      if (currentGameState === "started") {
        upKeyText.text = currentKeys.up.toUpperCase();
        downKeyText.text = currentKeys.down.toUpperCase();

        errorText.text = "";
        if (keyPressed(currentKeys.up)) {
          ship.y = ship.y - 5;
        } else if (keyPressed(currentKeys.down)) {
          ship.y = ship.y + 5;
        } else {
          Object.values(keyMap)
            .filter((a) => a !== currentKeys.down || a !== currentKeys.up)
            .forEach((a) => {
              if (keyPressed(a) && a !== "space") {
                audioAssets["assets/change.wav"].play();
                errorText.text = "CONTROL NOT FOUND";
              }
            });
        }

        currentKeys.count -= 0.2;

        if (currentKeys.count < 0) {
          currentKeys.count = 100;
          currentKeys.up = getRandomLetter();
          // cannot have same or w and s
          currentKeys.down = getRandomLetter();
          while (
            currentKeys.down === currentKeys.up &&
            (currentKeys.down !== "s" || currentKeys.up !== "w")
          ) {
            currentKeys.down = getRandomLetter();
          }
        }

        score += 0.2;

        // remove the tunnel bits outside view
        tunnelBits = tunnelBits.filter((sprite) => sprite.x >= 0);
        let crash = 0;
        tunnelBits.map((sprite) => {
          sprite.update();
          if (collides(ship, sprite)) {
            crash++;
          }
        });

        // rocks
        rocks = rocks.filter((sprite) => sprite.x >= 0);
        rocks.map((sprite) => {
          sprite.update();
          if (collides(ship, sprite)) {
            crash++;
          }
        });

        if (randInt(0, 100) > 98) {
          createRandomRock(
            currentTunnelY +
              randInt(-currentTunnelWidth / 2, currentTunnelWidth / 2)
          );
        }

        if (crash > 0) {
          audioAssets["assets/explosion.wav"].play();
          if (getStoreItem("score") && getStoreItem("score") < score) {
            setStoreItem("score", parseInt(score));
          }
          setStoreItem("lastscore", parseInt(score));
          resetGame();
          return;
        }

        // check if I should make more bits
        if (
          tunnelBits.filter((sprite) => canvas.width - sprite.width <= sprite.x)
            .length > 0
        ) {
          createTunnelBitTopBottom(currentTunnelWidth, currentTunnelY);
        }

        let frequencyParam = 0.1;
        if (randInt(0, 100) > 50) {
          frequencyParam = randInt(0, 10) / 10;
        }
        // minus to go up
        currentTunnelY -= Math.sin(frequencyParam * score);
        currentTunnelWidth -= 0.08;
        if (currentTunnelWidth < 0) {
          currentTunnelWidth = 0;
        }

        scoreText.text = `Score: ${parseInt(score)}`;

        controls.update();
        ship.update();
      }
    },
    render: function() {
      // render the game state
      if (currentGameState === "menu") {
        menuScene.render();
      }
      if (currentGameState === "started") {
        tunnelBits.map((sprite) => sprite.render());
        rocks.map((sprite) => sprite.render());
        ship.render();
        controls.render();
        scoreText.render();
      }

      if (currentGameState === "ended") {
      }
      // console.log(tunnelBits.length)
    },
  });

  loop.start(); // start the game
}

main();
