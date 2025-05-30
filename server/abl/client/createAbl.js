const Ajv = require("ajv");
const clientDao = require("../../dao/client-dao");
const { v4: uuidv4 } = require("uuid");

const schema = {
  type: "object",
  properties: {
    firstName: { type: "string" },
    lastName: { type: "string" }
  },
  required: ["firstName", "lastName"],
  additionalProperties: false
};
const ajv = new Ajv();
const validate = ajv.compile(schema);

module.exports = (req, res) => {
  const client = req.body;
  if (!validate(client)) return res.status(400).json({ error: validate.errors });
  // Generate unique ID for new client
  const newClient = { ...client, id: uuidv4() };
  clientDao.create(newClient);
  res.status(201).json(newClient);
};