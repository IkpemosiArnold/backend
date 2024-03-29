const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json(err);
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You are not logged in");
  }
};

// try this function
const testVerifyTokenFunc = async () => {
  const authHeader = req.headers["authorization"];
  
  if(typeof authHeader !== "undefined" && authHeader !== undefined){
    const token = authHeader.split(" ")[1];
    
    req.token = token;
    
    try{
      const verify = jwt.verify(req.token, process.env.JWT_SEC);
      req.user = verify;
      
      next()
    }catch(error){
      res.status(403).json({ message: "Invalid token" });
    }
  }else{
    return res.status(401).json("You are not logged in");
  }
}

const verifyTokenAndAuthorization = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("There's an error with the authentication");
    }
  });
};
const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("There's an error with the authentication");
    }
  });
};
module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
};
