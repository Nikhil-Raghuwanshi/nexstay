import express from "express";
import passport from "passport";
import { isLoggedIn, isNotLoggedIn, setRedirectUrl } from "../middleware.js";
import {
  getLoginForm,
  getSignupForm,
  login,
  logout,
  signup,
  getLanding,
} from "../controllers/user.js";

const router = express.Router();

router
  .route("/signup")
  .get(isNotLoggedIn, getSignupForm)
  .post(isNotLoggedIn, signup);

router
  .route("/login")
  .get(isNotLoggedIn, getLoginForm)
  .post(
    isNotLoggedIn,
    setRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  );

router.get("/logout", isLoggedIn, logout);
router.get("/",getLanding);
export { router };
