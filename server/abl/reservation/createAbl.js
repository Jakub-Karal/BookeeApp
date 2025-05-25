const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const reservationDao = require("../../dao/reservation-dao");
const clientDao = require("../../dao/client-dao");

const reservationSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    clientId: { type: "string" },
    date: { type: "string", format: "date-time" }
  },
  required: ["id", "date"],
  additionalProperties: false
};

const clientSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    firstName: { type: "string" },
    lastName: { type: "string" }
  },
  required: ["id", "firstName", "lastName"],
  additionalProperties: false
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateReservation = ajv.compile(reservationSchema);
const validateClient = ajv.compile(clientSchema);

module.exports = (req, res) => {
  const { id, clientId, date, client } = req.body;

  // Validate reservation fields (except clientId, which is optional at creation)
  if (!validateReservation({ id, clientId, date })) {
    return res.status(400).json({ error: validateReservation.errors });
  }

  let assignedClientId = clientId;

  if (clientId) {
    // If clientId is provided, check if it exists
    if (!clientDao.getById(clientId)) {
      return res.status(400).json({ error: "clientId does not exist" });
    }
  } else if (client) {
    // If no clientId, but client object is provided, validate and create client
    if (!validateClient(client)) {
      return res.status(400).json({ error: validateClient.errors });
    }
    if (clientDao.getById(client.id)) {
      return res.status(409).json({ error: "Client ID already exists" });
    }
    clientDao.create(client);
    assignedClientId = client.id;
  } else {
    return res.status(400).json({ error: "Either clientId or client object must be provided" });
  }

  // Check for reservation ID conflict
  if (reservationDao.getById(id)) {
    return res.status(409).json({ error: "Reservation ID already exists" });
  }

  const reservation = { id, clientId: assignedClientId, date };
  reservationDao.create(reservation);
  res.status(201).json(reservation);
};