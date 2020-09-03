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
} from "kontra";

import { textOptions, getRandomLetter } from "./utils.js";

const currentKeysDefault = { up: "w", down: "s", count: 100 };
function main() {
  let { canvas } = init();

  let currentGameState = "menu"; // menu, started, ended

  let currentTunnelWidth = 300;
  let currentTunnelY = canvas.height / 2;
  let currentKeys = currentKeysDefault;
  let tunnelBits = [];
  let score = 0;

  function resetGame() {
    currentTunnelWidth = 300;
    currentTunnelY = canvas.height / 2;
    currentKeys = currentKeysDefault;
    tunnelBits = [];
    score = 0;
    createTunnelBitTopBottom(currentTunnelWidth, currentTunnelY);
  }

  if(!getStoreItem('score')){
    setStoreItem('score', 1)
  }

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

  let lastScore = Text({
    text: "Highest Score: 0",
    ...textOptions,
  });

  let menu = Grid({
    x: canvas.width / 2,
    y: canvas.height / 2,
    anchor: { x: 0.5, y: 0.5 },

    // add 15 pixels of space between each row
    rowGap: 15,

    // center the children
    justify: "center",

    children: [start, help, lastScore],
  });

  let menuScene = Scene({
    id: "menu",
    onShow() {
      console.log("menu showed");
    },
    children: [menu],
  });

  function createTunnelBit(y) {
    let tunnelBit = Sprite({
      x: canvas.width,
      y,
      dx: -2,
      color: "red",
      height: 40,
      width: 2,
    });
    tunnelBits.push(tunnelBit);
  }

  function createTunnelBitTopBottom(width, y) {
    // top
    createTunnelBit(y - width / 2);
    // bottom
    createTunnelBit(y + width / 2);
  }

  let ship = Sprite({
    x: canvas.width / 4,
    y: canvas.height / 2,
    color: "blue",
    width: 50,
    height: 50,
    anchor: { x: 0, y: 0.5 },
    // dx: 2
  });

  let upKeyText = Text({
    text: currentKeys.up.toUpperCase(),
    ...textOptions,
    x: 40,
    y: canvas.height - 100,
    anchor: { x: 0, y: 0.5 },
    textAlign: "center",
  });

  let downKeyText = Text({
    text: currentKeys.down.toUpperCase(),
    ...textOptions,
    x: 40,
    y: canvas.height - 20,
    anchor: { x: 0, y: 0.5 },
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
    children: [upKeyText, downKeyText, errorText],
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
        lastScore.text = `Highest Score: ${getStoreItem('score')?getStoreItem('score'):0}`
      }

      if (keyPressed("space") && currentGameState === "menu") {
        currentGameState = "started";
      }

      // TODO: move out into own function I think
      if (currentGameState === "started") {
        // console.log(currentKeys.count)
        upKeyText.text = currentKeys.up.toUpperCase();
        downKeyText.text = currentKeys.down.toUpperCase();
        // console.log(currentKeys.up)

        errorText.text = "";
        if (keyPressed(currentKeys.up)) {
          ship.y = ship.y - 10;
        } else if (keyPressed(currentKeys.down)) {
          ship.y = ship.y + 10;
        } else {
          Object.values(keyMap)
            .filter((a) => a !== currentKeys.down || a !== currentKeys.up)
            .forEach((a) => {
              if (keyPressed(a)) {
                errorText.text = "CONTROL NOT FOUND";
              }
            });
        }

        currentKeys.count -= 0.2;

        if (currentKeys.count < 0) {
          currentKeys.count = 100;
          currentKeys.up = getRandomLetter();
          // cannot have same
          currentKeys.down = getRandomLetter();
          while (currentKeys.down === currentKeys.up) {
            currentKeys.down = getRandomLetter();
          }
        }

        score += 0.2;

        // remove the tunnel bits outside view
        tunnelBits = tunnelBits.filter((sprite) => sprite.x >= 0);
        tunnelBits.map((sprite) => {
          sprite.update();
          if (collides(ship, sprite)) {
            // crash
            // score = 0;
            if(getStoreItem('score') && getStoreItem('score')<score){
              console.log('set score', score)
              setStoreItem('score', parseInt(score))
            }
            resetGame();
            currentGameState = "menu";
          }
        });

        // check if I should make more bits
        if (
          tunnelBits.filter((sprite) => canvas.width - sprite.width <= sprite.x)
            .length > 0
        ) {
          // createTunnelBit(canvas.height/4)
          createTunnelBitTopBottom(currentTunnelWidth, currentTunnelY);
        }

        const frequencyParam = 0.1;
        currentTunnelY += Math.sin(frequencyParam * score);
        currentTunnelWidth -= 0.1

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
