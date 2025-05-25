const clientDao = require("../../dao/client-dao");
module.exports = (req, res) => {
  const deleted = clientDao.remove(req.body.id);
  if (!deleted) return res.status(404).json({ error: "Not found" });
  res.json(deleted);
};