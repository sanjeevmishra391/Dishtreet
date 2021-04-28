const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const bcrypt = require('bcryptjs');
const con = require("../db/connect");

exports.signup = (req, res) => {
  const  {name, email, password, mobile} = req.body;
  con.query("SELECT email FROM customer WHERE email = ?", [email], async function(err, results, field) {
    if (err) throw err;
    if(results.length > 0) {
      return res.render('signup', {message: "This email is already registered"});
    } else {
        let hashedPassword = await bcrypt.hash(password, 8);
        await con.query("INSERT INTO customer (cust_name, email, password, cust_contact) VALUES (?,?,?,?)", [name, email, hashedPassword, mobile], async function(err, results) {
        if (err) throw err;
        return res.render('signup', {message: "You are successfully registered"});
      });
    }
  });
}

exports.login = (req, res) => {
    try {
      const  {email, password} = req.body;
      con.query("SELECT * FROM customer WHERE email = ?", [email], async function(err, results) {
        const emailExist = await results;
        const isMatched = await bcrypt.compare(password, results[0].password);
        if(!emailExist || !isMatched)  {
          return res.status(401).render('login', {message:"Email or password is incorrect"});
        } else {
          const id = results[0].cust_ID;
          const token = jwt.sign( {id}, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
          });
          const cookieOptions = {
            expires: new Date(
              Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
          }

          res.cookie('jwt', token, cookieOptions);
          res.status(200).redirect("/");
        }
      })
    } catch (e) {
        res.status(401).render('login', {message:"Couldn't login"});
    }
}

exports.signout = (req, res) => {
  res.clearCookie('jwt');
  return res.redirect('/');
}

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['SM007']
});
