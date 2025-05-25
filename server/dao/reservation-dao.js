const { readReservations, writeReservations } = require("./storage/reservationStorage");

function getAll() {
  return readReservations();
}
function getById(id) {
  return readReservations().find(r => r.id === id);
}
function create(reservation) {
  const reservations = readReservations();
  reservations.push(reservation);
  writeReservations(reservations);
  return reservation;
}
function update(id, data) {
  const reservations = readReservations();
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1) return null;
  reservations[idx] = { ...reservations[idx], ...data };
  writeReservations(reservations);
  return reservations[idx];
}
function remove(id) {
  const reservations = readReservations();
  const idx = reservations.findIndex(r => r.id === id);
  if (idx === -1) return null;
  const [deleted] = reservations.splice(idx, 1);
  writeReservations(reservations);
  return deleted;
}

module.exports = { getAll, getById, create, update, remove };