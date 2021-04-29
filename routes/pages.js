const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const con = require("../db/connect");
const {getCities, getCustomerProfile, addAddress, featuredVendors, getVendors, getVendorProfile, featuredDishes, getDishes, getCart, addCart, deleteCart, placeOrder, updateCart, addReview} = require("../db/query");
const {requireSignin} = require("../controllers/auth");
const {loginAuth} = require("../middleware/auth");

var selectedCity = 211008;
var dishes = getDishes(selectedCity);
let cust_ID;

router.get("/", async (req, res) => {
  var cities = await getCities();
  var homeVendors = await featuredVendors(selectedCity);
  var homeDishes = await featuredDishes(selectedCity);
  if(req.query.valid) {
      selectedCity = req.query.valid;
  }
  res.render("home", {cityList: cities, vendorList: homeVendors, dishList: homeDishes, selectedCity: selectedCity});
});

router.get("/vendors", async (req, res) => {
  vendors = await getVendors(selectedCity);
  res.render("vendors", {vendorList: vendors});
});

router.get("/vendors/:ID", async (req, res) => {
  vendorProfile = await getVendorProfile(req.params.ID);
  res.render("vendor-profile", {ven: vendorProfile});
});

router.get("/dishes", async (req, res) => {
  dishes = await getDishes(selectedCity);
  res.render("dishes", {dishList: dishes});
});

router.get("/cart", loginAuth, async (req, res) => {
  const webToken = req.cookies.jwt;
  const verify = await jwt.verify(webToken, process.env.JWT_SECRET);
  cust_ID = verify.id;
  var cart = await getCart(cust_ID);
  res.render("cart", {cartList: cart});
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/logout", loginAuth, async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.redirect("/login");
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/profile", loginAuth, async (req, res) => {
  const webToken = req.cookies.jwt;
  const verify = await jwt.verify(webToken, process.env.JWT_SECRET);
  cust_ID = verify.id;
  var customer = await getCustomerProfile(cust_ID);
  res.render("profile", {cust: customer, addressList: customer.cust_address, orderList: customer.orders});
});

router.post("/", (req, res) => {
  zip = parseInt(req.body.city_zip);
  homeVendors =  featuredVendors(zip);
  homeDishes =  featuredDishes(zip);
  res.redirect("/?valid="+encodeURIComponent(zip));
});

router.post("/profile", (req, res) => {
  const d = req.body;
  addAddress(id, d.house_no, d.street, d.zip, d.city, d.state);
  customer = getCustomerProfile(id);
  res.redirect("/profile");
});

router.post("/cart/add", (req, res) => {
  var dish_ID = req.body.dish_ID;
  addCart(cust_ID, dish_ID, 1);
  res.redirect("/");
});

router.post("/cart/delete", (req, res) => {
  var dish_ID = req.body.dish_ID;
  deleteCart(cust_ID, dish_ID);
  res.redirect("/cart");
});

router.post("/cart/place-order", (req, res) => {
  const o = req.body;
  placeOrder(cust_ID, o.time, o.mode, o.actual_price, o.tax, o.discount, o.final_price);
  res.redirect("/");
});

router.post("/cart/update", (req, res) => {
  const u = req.body;
  updateCart(u.qty, cust_ID, u.dish_ID);
  res.redirect("/cart");
});

router.post("/vendors/review", async (req, res) => {
  const r = req.body;
  const url = req.headers.referer;
  const ven_ID = url.substring(30);
  const webToken = req.cookies.jwt;
  const verify = await jwt.verify(webToken, process.env.JWT_SECRET);
  cust_ID = verify.id;
  addReview(ven_ID, cust_ID, r.stars, r.comment);
  res.redirect("/vendors/"+ven_ID);
});

module.exports = router;
