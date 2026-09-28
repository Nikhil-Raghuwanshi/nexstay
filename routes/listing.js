import express from "express";
import { isLoggedIn, isOwner } from "../middleware.js";
import { validateListing } from "../middleware.js";
import multer from "multer";
import {storage } from "../cloudConfig.js";
import {
  getEditListing,
  index,
  getNewListing,
  postNewListing,
  showListing,
  postEditListing,
  deleteListing,
  searchRoute
} from "../controllers/listing.js";

const router = express.Router();
const upload = multer({ storage });

router
  .route("/")
  .get(index)
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    postNewListing
  );

// New Listing
router.get("/new", isLoggedIn, getNewListing);

router.get("/search",searchRoute);

router
  .route("/:id")
  .get(showListing)
  .patch(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    postEditListing
  )
  .delete(isLoggedIn, isOwner, deleteListing);

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, getEditListing);

export { router };
