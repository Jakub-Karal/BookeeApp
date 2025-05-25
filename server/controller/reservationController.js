const express = require("express");
const router = express.Router();
const createAbl = require("../abl/reservation/createAbl");
const getAbl = require("../abl/reservation/getAbl");
const listAbl = require("../abl/reservation/listAbl");
const updateAbl = require("../abl/reservation/updateAbl");
const deleteAbl = require("../abl/reservation/deleteAbl");

router.post("/", createAbl);
router.get("/", listAbl);
router.get("/:id", getAbl);
router.put("/:id", updateAbl);
router.delete("/:id", deleteAbl);

module.exports = router;