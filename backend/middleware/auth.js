const jwt = require("jsonwebtoken")

const auth = (req,res,next)=>{
  const bearerHeader = req.headers.authorization

  if(!bearerHeader || !bearerHeader.startsWith("Bearer "))
    return res.status(401).json({message:"Access Denied"})

  const token = bearerHeader.split(" ")[1]

  try {
   const verifyuser =  jwt.verify(token,process.env.JWT_SECRET)
   req.user = verifyuser
   next()
  } catch (error) {
    return res.status(403).json({message:"Token expired or invalid"})
  }
  }

  const adminAuth = (req, res, next) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Admins only" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  


  module.exports = {auth,adminAuth}