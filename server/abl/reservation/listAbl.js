const reservationDao = require("../../dao/reservation-dao");
module.exports = (req, res) => {
  res.json(reservationDao.getAll());
};