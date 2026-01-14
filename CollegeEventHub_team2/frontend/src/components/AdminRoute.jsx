// // import { Navigate } from "react-router-dom";
// // import { useAuth } from "../context/AuthContext";

// // const AdminRoute = ({ children }) => {
// //   const { user, loading } = useAuth();


// //   if (loading) return null;

// //   if (!user || user.role !== "admin") {
// //     return <Navigate to="/" replace />;
// //   }

// //   return children;
// // };

// // export default AdminRoute;





// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const AdminRoute = ({ children }) => {
//   const { user } = useAuth();

//   // 🔥 VERY IMPORTANT
//   if (user === null) {
//     return null; // or loader
//   }

//   if (user.role !== "admin") {
//     return <Navigate to="/student-dashboard" replace />;
//   }
//   console.log("ADMIN USER:", user);
//   return children; // ✅ THIS WAS MISSING / WRONG
// };

// export default AdminRoute;





import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "organizer") {
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
