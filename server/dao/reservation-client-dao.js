const { readReservations } = require("./storage/reservationStorage");

function getByClientId(clientId) {
  return readReservations().filter(r => r.clientId === clientId);
}

module.exports = { getByClientId };
