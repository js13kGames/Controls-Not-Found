import {
  init,
  Sprite,
  GameLoop,
  initKeys,
  keyPressed,
  Text,
  Scene,
  degToRad,
  collides,
} from "kontra";

function main() {
  let { canvas } = init();

  let currentTunnelWidth = 300;
  let currentTunnelY = canvas.height / 2;

  let currentKeys = { up: "w", down: "s", count: 100 };

  let tunnelBits = [];

  let score = 0;

  function getRandomLetter() {
    return String.fromCharCode(
      Math.floor(Math.random() * 26) + 65
    ).toLowerCase();
  }

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
    x: canvas.width / 4, // starting x,y position of the sprite
    y: canvas.height / 2,
    color: "blue", // fill color of the sprite rectangle
    width: 50, // width and height of the sprite rectangle
    height: 50,
    anchor: { x: 0, y: 0.5 },
    // dx: 2          // move the sprite 2px to the right every frame
  });

  let upKeyText = Text({
    text: currentKeys.up.toUpperCase(),
    font: "20px Arial",
    color: "white",
    x: 40,
    y: canvas.height - 100,
    anchor: { x: 0, y: 0.5 },
    textAlign: "center",
  });

  let downKeyText = Text({
    text: currentKeys.down.toUpperCase(),
    font: "20px Arial",
    color: "white",
    x: 40,
    y: canvas.height - 20,
    anchor: { x: 0, y: 0.5 },
    textAlign: "center",
  });

  let scoreText = Text({
    text: "Score: 0",
    font: "20px Arial",
    color: "white",
    x: canvas.width - 10,
    y: canvas.height - 20,
    anchor: { x: 1, y: 0.5 },
    textAlign: "center",
  });

  let controls = Scene({
    id: "display",
    children: [upKeyText, downKeyText],
  });

  initKeys();

  // start tunnel
  // createTunnelBit(canvas.height/4)
  createTunnelBitTopBottom(currentTunnelWidth, currentTunnelY);

  let loop = GameLoop({
    // create the main game loop
    update: function() {
      // update the game state

      // console.log(currentKeys.count)
      upKeyText.text = currentKeys.up.toUpperCase();
      downKeyText.text = currentKeys.down.toUpperCase();
      // console.log(currentKeys.up)
      if (keyPressed(currentKeys.up)) {
        ship.y = ship.y - 10;
      }

      if (keyPressed(currentKeys.down)) {
        ship.y = ship.y + 10;
      }

      currentKeys.count -= 0.3;

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
          score = 0;
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
      currentTunnelY += 0.1;

      scoreText.text = `Score: ${parseInt(score)}`;

      controls.update();
      ship.update();
    },
    render: function() {
      // render the game state
      tunnelBits.map((sprite) => sprite.render());

      ship.render();
      controls.render();
      scoreText.render();
      // console.log(tunnelBits.length)
    },
  });

  loop.start(); // start the game
}

main();
