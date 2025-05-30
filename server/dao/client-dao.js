const { readClients, writeClients } = require("./storage/clientStorage");

function getAll() {
  return readClients();
}
function getById(id) {
  return readClients().find(c => c.id === id);
}
function create(client) {
  try {
    const clients = readClients();
    clients.push(client);
    writeClients(clients);
    return client;
  } catch (err) {
    console.error("Error in clientDao.create:", err);
    throw err;
  }
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