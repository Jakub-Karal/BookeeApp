const Ajv = require("ajv");
const clientDao = require("../../dao/client-dao");

const schema = {
  type: "object",
  properties: {
    firstName: { type: "string", maxLength: 50 },
    lastName: { type: "string", maxLength: 50 }
  },
  required: [],
  additionalProperties: false
};
const ajv = new Ajv();
const validate = ajv.compile(schema);

module.exports = (req, res) => {
  const update = req.body;
  if (!validate(update)) return res.status(400).json({ error: validate.errors });

  // Kontrola na duplicitu jména a příjmení (case-insensitive), pokud se mění jméno nebo příjmení
  if (update.firstName && update.lastName) {
    const allClients = clientDao.getAll();
    const exists = allClients.some(c =>
      c.id !== req.params.id &&
      c.firstName.trim().toLowerCase() === update.firstName.trim().toLowerCase() &&
      c.lastName.trim().toLowerCase() === update.lastName.trim().toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ error: "Klient se stejným jménem a příjmením již existuje." });
    }
  }

  const updated = clientDao.update(req.params.id, update);
  if (!updated) return res.status(404).json({ error: "Not found" });
  res.json(updated);
};