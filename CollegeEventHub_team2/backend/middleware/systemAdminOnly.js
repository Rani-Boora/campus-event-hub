// backend/middleware/systemAdminOnly.js

const systemAdminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "system_admin") {
      return res.status(403).json({
        success: false,
        message: "System admin access only"
      });
    }
    next();
  };
  
  export default systemAdminOnly;
  