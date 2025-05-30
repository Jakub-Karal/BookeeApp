const express = require("express");
const router = express.Router();
const createAbl = require("../abl/reservation/createAbl");
const getAbl = require("../abl/reservation/getAbl");
const listAbl = require("../abl/reservation/listAbl");
const updateAbl = require("../abl/reservation/updateAbl");
const deleteAbl = require("../abl/reservation/deleteAbl");

// RESTful endpoints for frontend compatibility
router.get("/", listAbl); // GET /reservations
router.post("/", createAbl); // POST /reservations
router.put("/:id", updateAbl); // PUT /reservations/:id
router.delete("/:id", deleteAbl); // DELETE /reservations/:id

// Legacy endpoints (ponecháno pro zpětnou kompatibilitu)
router.post("/create", createAbl);
router.get("/list", listAbl);
router.post("/get", getAbl);
router.post("/update", updateAbl);
router.post("/delete", deleteAbl);

module.exports = router;