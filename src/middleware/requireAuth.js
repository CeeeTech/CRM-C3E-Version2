const jwt = require("jsonwebtoken");
const User = require("../models/user");

async function requireAuth(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  try {
    const { _id } = jwt.verify(token, secret);
    req.user = await User.findById(_id);
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Handle expired token error
      return res.status(401).json({ error: "Token expired" });
    } else {
      // Handle other JWT verification errors
      console.error("Error verifying JWT token:", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: error.message });
    }
  }
}

module.exports = requireAuth;
