import { User } from "../models/user.js";

export const getSignupForm=(req, res) => {
  res.render("users/signUp.ejs");
};

export const signup=async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registredUser = await User.register(newUser, password);
    req.login(registredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `welcome ${newUser.username}`);
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", "Username already exists!");
    res.redirect("/signup");
  }
};

export const getLoginForm=(req, res) => {
  res.render("users/login.ejs");
}

export const login=async (req, res) => {
    req.flash("success", `Welcome back ${req.user.username}`);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    // If user came from review submission
    if (redirectUrl.includes("/reviews")) {
      let listingId = redirectUrl.split("/")[2];
      return res.redirect(`/listings/${listingId}`);
    }
    res.redirect(redirectUrl);
  };

export const logout=(req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You have been logged out.");
    res.redirect("/listings");
  });
}