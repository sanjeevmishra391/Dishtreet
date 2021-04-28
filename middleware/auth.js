const jwt = require('jsonwebtoken');

exports.loginAuth = async (req, res, next) => {
  try {
    const webToken = req.cookies.jwt;
    const verify = await jwt.verify(webToken, process.env.JWT_SECRET);
    id = verify.id;
    next();
  } catch (e) {
    res.render("login");
  }
}
