const clientDao = require("../../dao/client-dao");
module.exports = (req, res) => {
  res.json(clientDao.getAll());
};