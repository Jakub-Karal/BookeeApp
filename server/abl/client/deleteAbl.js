const clientDao = require("../../dao/client-dao");
const { getByClientId } = require("../../dao/reservation-client-dao");

module.exports = (req, res) => {
  // Check if client has any reservations
  const reservations = getByClientId(req.params.id);
  if (reservations && reservations.length > 0) {
    return res.status(400).json({ error: "Nelze smazat klienta s aktivní rezervací." });
  }
  const deleted = clientDao.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json(deleted);
};