const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const reservationDao = require("../../dao/reservation-dao");
const clientDao = require("../../dao/client-dao");
const { v4: uuidv4 } = require("uuid");

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

// Nové schéma pro frontend: přijímá clientId, date (YYYY-MM-DD), hour (číslo)
const frontendReservationSchema = {
  type: "object",
  properties: {
    clientId: { type: "string" },
    date: { type: "string" }, // pouze datum ve formátu YYYY-MM-DD
    hour: { type: "number" }
  },
  required: ["clientId", "date", "hour"],
  additionalProperties: false
};

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validateReservation = ajv.compile(reservationSchema);
const validateClient = ajv.compile(clientSchema);
const validateFrontendReservation = ajv.compile(frontendReservationSchema);

module.exports = (req, res) => {
  console.log("POST /reservations", req.body);
  // Pokud request obsahuje hour, je to požadavek z frontendové aplikace
  if (req.body.hour !== undefined) {
    if (!validateFrontendReservation(req.body)) {
      console.error("Validation error (frontend reservation):", validateFrontendReservation.errors);
      return res.status(400).json({ error: validateFrontendReservation.errors });
    }
    const { clientId, date, hour } = req.body;
    if (!clientDao.getById(clientId)) {
      console.error("clientId does not exist", clientId);
      return res.status(400).json({ error: "clientId does not exist" });
    }
    // Složit ISO datetime z date a hour (např. 2025-06-01T10:00:00.000Z)
    const dateObj = new Date(date);
    dateObj.setHours(hour, 0, 0, 0);
    const isoDate = dateObj.toISOString();
    const id = uuidv4();
    // Kontrola kolize rezervace na stejný čas
    const allReservations = reservationDao.getAll();
    if (allReservations.find(r => r.date === isoDate)) {
      console.error("Rezervace na tento čas již existuje", isoDate);
      return res.status(409).json({ error: "Rezervace na tento čas již existuje." });
    }
    const reservation = { id, clientId, date: isoDate, hour };
    reservationDao.create(reservation);
    console.log("Reservation created", reservation);
    return res.status(201).json(reservation);
  }

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