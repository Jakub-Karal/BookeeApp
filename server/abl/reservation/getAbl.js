const reservationDao = require("../../dao/reservation-dao");
module.exports = (req, res) => {
  const reservation = reservationDao.getById(req.params.id);
  if (!reservation) return res.status(404).json({ error: "Not found" });
  res.json(reservation);
};