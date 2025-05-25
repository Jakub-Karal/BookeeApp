const express = require("express");
const router = express.Router();
const createAbl = require("../abl/client/createAbl");
const getAbl = require("../abl/client/getAbl");
const listAbl = require("../abl/client/listAbl");
const updateAbl = require("../abl/client/updateAbl");
const deleteAbl = require("../abl/client/deleteAbl");

router.post("/create", createAbl);
router.get("/list", listAbl);
router.post("/get", getAbl);
router.post("/update", updateAbl);
router.post("/delete", deleteAbl);

module.exports = router;