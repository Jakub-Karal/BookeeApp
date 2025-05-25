const Ajv = require("ajv");
const clientDao = require("../../dao/client-dao");

const schema = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" }
  },
  required: [],
  additionalProperties: false
};
const ajv = new Ajv();
const validate = ajv.compile(schema);

module.exports = (req, res) => {
  const update = req.body;
  if (!validate(update)) return res.status(400).json({ error: validate.errors });
  const updated = clientDao.update(req.body.id, update);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};