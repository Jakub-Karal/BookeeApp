const express = require("express");
const router = express.Router();
const createAbl = require("../abl/reservation/createAbl");
const getAbl = require("../abl/reservation/getAbl");
const listAbl = require("../abl/reservation/listAbl");
const updateAbl = require("../abl/reservation/updateAbl");
const deleteAbl = require("../abl/reservation/deleteAbl");

router.post("/create", createAbl);
router.get("/list", listAbl);
router.post("/get", getAbl);
router.post("/update", updateAbl);
router.post("/delete", deleteAbl);

module.exports = router;