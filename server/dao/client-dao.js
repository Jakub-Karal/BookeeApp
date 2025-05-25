const { readClients, writeClients } = require("./storage/clientStorage");

function getAll() {
  return readClients();
}
function getById(id) {
  return readClients().find(c => c.id === id);
}
function create(client) {
  const clients = readClients();
  clients.push(client);
  writeClients(clients);
  return client;
}
function update(id, data) {
  const clients = readClients();
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  clients[idx] = { ...clients[idx], ...data };
  writeClients(clients);
  return clients[idx];
}
function remove(id) {
  const clients = readClients();
  const idx = clients.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const [deleted] = clients.splice(idx, 1);
  writeClients(clients);
  return deleted;
}

module.exports = { getAll, getById, create, update, remove };