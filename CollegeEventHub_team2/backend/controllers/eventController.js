
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import Registration from "../models/registrationModel.js";
import Review from "../models/reviewModel.js";

export const createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    

    const isDraft = req.body.draft === true || req.body.draft === "true";

const event = new Event({
  ...req.body,
  createdBy: req.user.id,
  creatorName: user.name,
  draft: isDraft,
  published: !isDraft
});

    // const event = new Event({ 
    //   ...req.body, 
    //   createdBy: req.user.id,
    //   creatorName: user.name,
    //   draft: req.body.draft || false,
    //   published: !req.body.draft
    // });
    
    await event.save();
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    console.log("Incoming GET my_events"); 
    const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    console.log("Found events:", events.length);
    res.json({ success: true, events });
  } catch (err) {
    console.error("Error in getMyEvents:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
    }
    
    await Event.findByIdAndDelete(req.params.eventId);
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this event" });
    }
    
    const updateData = { ...req.body };
    
    if (updateData.draft !== undefined) {
      updateData.published = !updateData.draft;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.eventId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// export const getAllEvents = async (req, res) => {
//   try {
//     // Only fetch published events (not drafts)
//     const events = await Event.find({ published: true })
//       .sort({ createdAt: -1 })
//       .populate('createdBy', 'name email')
//       .lean();

//     // Get registration counts for all events
//     const eventIds = events.map(event => event._id);
    
//     const registrationCounts = await Registration.aggregate([
//       {
//         $match: {
//           event: { $in: eventIds },
//           status: { $in: ['pending', 'approved'] }
//         }
//       },
//       {
//         $group: {
//           _id: '$event',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Get review statistics for all events
//     const reviewStats = await Review.aggregate([
//       {
//         $match: {
//           event: { $in: eventIds },
//           isVisible: true
//         }
//       },
//       {
//         $group: {
//           _id: '$event',
//           reviewCount: { $sum: 1 },
//           averageRating: { $avg: '$rating' }
//         }
//       }
//     ]);

//     // Create maps for easy lookup
//     const registrationCountMap = {};
//     registrationCounts.forEach(item => {
//       registrationCountMap[item._id.toString()] = item.count;
//     });

//     const reviewStatsMap = {};
//     reviewStats.forEach(item => {
//       reviewStatsMap[item._id.toString()] = {
//         reviewCount: item.reviewCount,
//         averageRating: Math.round(item.averageRating * 10) / 10 || 0
//       };
//     });

//     // Add registration counts and review stats to events
//     const eventsWithStats = events.map(event => {
//       const eventId = event._id.toString();
//       const reviewStat = reviewStatsMap[eventId] || { reviewCount: 0, averageRating: 0 };
      
//       return {
//         ...event,
//         registeredCount: registrationCountMap[eventId] || 0,
//         reviewCount: reviewStat.reviewCount,
//         averageRating: reviewStat.averageRating
//       };
//     });

//     res.json({ success: true, events: eventsWithStats });

//   } catch (err) {
//     console.error("Error getting events:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };





// export const getAllEvents = async (req, res) => {
//   try {
//     // 1️⃣ Pagination (MANDATORY)
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     // 2️⃣ Fetch paginated events only
//     const events = await Event.find({ published: true })
//       .sort({ createdAt: -1 })
//       // .select("title date location createdBy")
//       .select("title startDate endDate venue createdBy category image")

//       .populate("createdBy", "name email")
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const eventIds = events.map(e => e._id);

//     // 3️⃣ Aggregation: Registration counts (indexed fields)
//     const registrationCounts = await Registration.aggregate([
//       {
//         $match: {
//           event: { $in: eventIds },
//           status: { $in: ["pending", "approved"] }
//         }
//       },
//       {
//         $group: {
//           _id: "$event",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // 4️⃣ Aggregation: Review stats
//     const reviewStats = await Review.aggregate([
//       {
//         $match: {
//           event: { $in: eventIds },
//           isVisible: true
//         }
//       },
//       {
//         $group: {
//           _id: "$event",
//           reviewCount: { $sum: 1 },
//           averageRating: { $avg: "$rating" }
//         }
//       }
//     ]);

//     // 5️⃣ Convert aggregation results to maps (O(1) lookup)
//     const registrationMap = {};
//     registrationCounts.forEach(r => {
//       registrationMap[r._id.toString()] = r.count;
//     });

//     const reviewMap = {};
//     reviewStats.forEach(r => {
//       reviewMap[r._id.toString()] = {
//         reviewCount: r.reviewCount,
//         averageRating: Math.round((r.averageRating || 0) * 10) / 10
//       };
//     });

//     // 6️⃣ Merge stats with events
//     const enrichedEvents = events.map(event => {
//       const id = event._id.toString();
//       const review = reviewMap[id] || { reviewCount: 0, averageRating: 0 };

//       return {
//         ...event,
//         registeredCount: registrationMap[id] || 0,
//         reviewCount: review.reviewCount,
//         averageRating: review.averageRating
//       };
//     });

//     // 7️⃣ Total count for pagination
//     const totalEvents = await Event.countDocuments({ published: true });

//     res.status(200).json({
//       success: true,
//       page,
//       totalPages: Math.ceil(totalEvents / limit),
//       totalEvents,
//       data: enrichedEvents
//     });

//   } catch (err) {
//     console.error("Error getting events:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };







export const getAllEvents = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const events = await Event.find({ published: true })
      .sort({ createdAt: -1 })
      .select("title startDate endDate venue category image createdBy")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .lean();

    const eventIds = events.map(e => e._id);

    const registrationCounts = await Registration.aggregate([
      { $match: { event: { $in: eventIds }, status: { $in: ["pending", "approved"] } } },
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);

    const reviewStats = await Review.aggregate([
      { $match: { event: { $in: eventIds }, isVisible: true } },
      { $group: { _id: "$event", reviewCount: { $sum: 1 }, averageRating: { $avg: "$rating" } } }
    ]);

    const regMap = {};
    registrationCounts.forEach(r => regMap[r._id.toString()] = r.count);

    const revMap = {};
    reviewStats.forEach(r => {
      revMap[r._id.toString()] = {
        reviewCount: r.reviewCount,
        averageRating: Math.round((r.averageRating || 0) * 10) / 10
      };
    });

    const enrichedEvents = events.map(e => {
      const id = e._id.toString();
      const review = revMap[id] || { reviewCount: 0, averageRating: 0 };

      return {
        ...e,
        registeredCount: regMap[id] || 0,
        reviewCount: review.reviewCount,
        averageRating: review.averageRating
      };
    });

    const totalEvents = await Event.countDocuments({ published: true });

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "Surrogate-Control": "no-store"
    });
    

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalEvents / limit),
      totalEvents,
      data: enrichedEvents
    });

  } catch (err) {
    console.error("Error getting events:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};





export const getAllEventsAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status === "published") filter.published = true;
    if (req.query.status === "draft") filter.draft = true;

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .select("title category draft published createdBy startDate")
      .populate("createdBy", "name email")
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Event.countDocuments(filter);

    res.json({ success: true, total, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
