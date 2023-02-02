const express = require("express");

const router = express.Router();

const HolidayController = require("../controllers/HolidayController")

router.get("/api/holiday/getHolidayDate",HolidayController.apiGetListHolidayDate)
router.post("/api/holiday/postHolidayDate",HolidayController.apiPostHolidayDate)
router.put("/api/holiday/getHolidayDate",HolidayController.apiPutHolidayDate)

module.exports = router