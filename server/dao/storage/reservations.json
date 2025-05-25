const Ajv = require("ajv");
const clientDao = require("../../dao/client-dao");

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" }
  },
  required: ["id", "firstName", "lastName"],
  additionalProperties: false
};
const ajv = new Ajv();
const validate = ajv.compile(schema);

module.exports = (req, res) => {
  const client = req.body;
  if (!validate(client)) return res.status(400).json({ error: validate.errors });
  if (clientDao.getById(client.id)) return res.status(409).json({ error: "ID exists" });
  clientDao.create(client);
  res.status(201).json(client);
};