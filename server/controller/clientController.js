const express = require("express");
const router = express.Router();
const createAbl = require("../abl/client/createAbl");
const getAbl = require("../abl/client/getAbl");
const listAbl = require("../abl/client/listAbl");
const updateAbl = require("../abl/client/updateAbl");
const deleteAbl = require("../abl/client/deleteAbl");

router.post("/", createAbl);
router.get("/", listAbl);
router.get("/:id", getAbl);
router.put("/:id", updateAbl);
router.delete("/:id", deleteAbl);

module.exports = router;