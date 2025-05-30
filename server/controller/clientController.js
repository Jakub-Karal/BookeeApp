const express = require("express");
const router = express.Router();
const createAbl = require("../abl/client/createAbl");
const getAbl = require("../abl/client/getAbl");
const listAbl = require("../abl/client/listAbl");
const updateAbl = require("../abl/client/updateAbl");
const deleteAbl = require("../abl/client/deleteAbl");

// RESTful endpoints for frontend compatibility
router.get("/", listAbl); // GET /clients
router.post("/", createAbl); // POST /clients
router.put("/:id", updateAbl); // PUT /clients/:id
router.delete("/:id", deleteAbl); // DELETE /clients/:id

// Legacy endpoints (optional, for backward compatibility)
router.post("/create", createAbl);
router.get("/list", listAbl);
router.post("/get", getAbl);
router.post("/update", updateAbl);
router.post("/delete", deleteAbl);

module.exports = router;