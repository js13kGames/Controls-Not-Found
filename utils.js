import {
  randInt,
} from "kontra";

export let textOptions = {
  color: "white",
  font: "20px Arial, sans-serif",
};

export function getRandomLetter() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65).toLowerCase();
}

export function getRandomTunnelColor() {
  const tunnelColors = ['#8c3b0c', '#3b2121', '#542424', '#2d2424']
  return tunnelColors[randInt(0,tunnelColors.length-1)];
}