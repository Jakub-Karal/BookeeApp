const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "reservations.json");

function readReservations() {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function writeReservations(reservations) {
  fs.writeFileSync(filePath, JSON.stringify(reservations, null, 2));
}
module.exports = { readReservations, writeReservations };