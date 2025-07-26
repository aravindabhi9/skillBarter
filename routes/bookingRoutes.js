// ...existing code...

const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/book/:skillId", auth, bookingController.bookSkill);
router.get("/requests", auth, bookingController.getRequests);
router.get("/my", auth, bookingController.getMyBookings);
router.get("/provider-chats", auth, bookingController.getProviderChats);
router.get("/:bookingId", auth, bookingController.getBookingById);
router.post("/respond/:bookingId", auth, bookingController.respondBooking);
router.post("/pay/:bookingId", auth, bookingController.payForBooking);
router.put("/schedule/:bookingId", auth, bookingController.scheduleClass);
router.put("/reschedule/:bookingId", auth, bookingController.rescheduleMeeting);
router.get("/allow-rating/:bookingId", auth, bookingController.allowRating);
router.post("/payments/initiate", auth, paymentController.initiatePayment);
// Optionally keep or update scheduleClass if needed
router.put("/mark-done/:bookingId", auth, bookingController.markClassDone);
module.exports = router;
