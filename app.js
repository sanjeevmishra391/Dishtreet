const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require("ejs");
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config({path: './.env'});

//bringing in routes
const pagesRoutes = require('./routes/pages');
const authRoutes = require('./routes/auth');

//middleware
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

// defining routes
app.use("/", pagesRoutes);
app.use("/login", pagesRoutes);
app.use("/logout", pagesRoutes);
app.use("/auth", authRoutes);
app.use("/profile", pagesRoutes);
app.use("/vendors", pagesRoutes);
app.use("/vendors/:vendor-profile", pagesRoutes);
app.use("/dishes", pagesRoutes);
app.use("/cart", pagesRoutes);
app.use(function(err, req, res) {
  if(err.name === 'UnauthorizedError') {
    res.status(401).send("Invalid token");
  }
})

const port = 3000 || process.env.PORT;
app.listen(port, () => {
  console.log(`Listening to the port: ${port}`);
});
