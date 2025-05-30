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
  console.log("POST /clients request body:", req.body);
  const client = req.body;
  if (!validate(client)) {
    console.error("Validation error:", validate.errors);
    return res.status(400).json({ error: validate.errors });
  }
  // Generate unique ID for new client
  const newClient = { ...client, id: uuidv4() };
  try {
    clientDao.create(newClient);
    res.status(201).json(newClient);
  } catch (err) {
    console.error("Error creating client:", err);
    res.status(500).json({ error: "Failed to create client", details: err.message });
  }
};