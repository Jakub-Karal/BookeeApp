const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "clients.json");

function readClients() {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function writeClients(clients) {
  fs.writeFileSync(filePath, JSON.stringify(clients, null, 2));
}
module.exports = { readClients, writeClients };