const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const reservationDao = require("../../dao/reservation-dao");
const clientDao = require("../../dao/client-dao");

const schema = {
  type: "object",
  properties: {
    clientId: { type: "string" },
    date: { type: "string", format: "date-time" }
  },
  required: [],
  additionalProperties: false
};
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);

module.exports = (req, res) => {
  const update = req.body;
  if (!validate(update)) return res.status(400).json({ error: validate.errors });
  if (update.clientId && !clientDao.getById(update.clientId)) {
    return res.status(400).json({ error: "clientId does not exist" });
  }
  const updated = reservationDao.update(req.params.id, update);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};