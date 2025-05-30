const reservationDao = require("../../dao/reservation-dao");
module.exports = (req, res) => {
  const deleted = reservationDao.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json(deleted);
};