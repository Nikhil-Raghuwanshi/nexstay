import "dotenv/config";
import express from "express";
import engine from "ejs-mate";
import methodOverride from "method-override";
import connectDB from "./config/db.js";
import path from "path";
import { expressError } from "./utils/expressError.js";
import { router as listingRouter } from "./routes/listing.js";
import { router as reviewRouter } from "./routes/review.js";
import { router as userRouter } from "./routes/users.js";
import { router as privacyRouter } from "./routes/privacyTermsHelp.js";
import { fileURLToPath } from "url";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import { Listing } from "./models/listing.js";

import { User } from "./models/user.js";
import passport from "passport";
import LocalStrategy from "passport-local";

const app = express();

// set up filePath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

// set ViewEngine
app.engine("ejs", engine);
app.set("view engine", "ejs");

// Data Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Overriding method
app.use(methodOverride("_method"));

// connect database
try {
  await connectDB();
} catch (err) {
  console.log(err);
}

// Session middleware
const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",(err)=>{
  console.log("ERROR IN MONGO SESSION STORE",err);;
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// passport- User Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  res.locals.mapToken = process.env.MAP_TOKEN;
  next();
});

app.get("/", async (req, res, next) => {
    try {
        const listings = await Listing.find({}).limit(6);
        res.render("landing/landing.ejs", { listings });
    } catch (err) {
        next(err);
    }
});

// listings route
app.use("/listings", listingRouter);

// Footer Route
app.use("/privacyTermsHelp", privacyRouter);

// review route
app.use("/listings/:id/reviews", reviewRouter);

// user route
app.use("/", userRouter);

// Default Route
app.all("/{*splat}", (req, res, next) => {
  next(new expressError(404, "Page not found!"));
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("listings/error.ejs", { message });
});

const port = process.env.PORT || 3000;
app.listen(port, (req,res) => {
  console.log(`Server running on port ${port}`);
});
