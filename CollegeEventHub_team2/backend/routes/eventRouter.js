
import express from "express";
import { createEvent, getMyEvents ,deleteEvent ,updateEvent ,getAllEvents,getAllEventsAdmin} from "../controllers/eventController.js";
import userAuth from "../middleware/userAuth.js";
import adminOnly from "../middleware/adminOnly.js";

const router = express.Router();

router.post("/create_event", userAuth,adminOnly, createEvent);
router.get("/my_events", userAuth, getMyEvents);
router.delete("/delete_event/:eventId", userAuth,adminOnly, deleteEvent);
router.put("/update_event/:eventId", userAuth,adminOnly, updateEvent);

router.get("/", userAuth, getAllEvents);

router.get("/all_events", userAuth, getAllEvents);

router.get("/admin/events", userAuth, adminOnly, getAllEventsAdmin);


export default router;
