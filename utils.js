export let textOptions = {
  color: "white",
  font: "20px Arial, sans-serif",
};

export function getRandomLetter() {
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65).toLowerCase();
}
