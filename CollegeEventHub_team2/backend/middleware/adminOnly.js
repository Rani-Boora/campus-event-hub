import User from "../models/userModel.js";

const adminOnly = async (req, res, next) => {
  try {
    // req.user.id comes from userAuth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Admin access only"
      });
    }

    next(); // user is admin → allow access
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Authorization failed"
    });
  }
};

export default adminOnly;
