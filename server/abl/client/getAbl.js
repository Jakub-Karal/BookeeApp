const clientDao = require("../../dao/client-dao");
module.exports = (req, res) => {
  const client = clientDao.getById(req.body.id);
  if (!client) return res.status(404).json({ error: "Not found" });
  res.json(client);
};