import express from "express";
import { isLoggedIn, isReviewOwner } from "../middleware.js";
import { validateReview } from "../middleware.js";
import { deleteReview, postReview } from "../controllers/review.js";

const router = express.Router({ mergeParams: true });

// Write reviews
router.post("/", isLoggedIn, validateReview, postReview);

// delete reviews
router.delete("/:reviewId", isLoggedIn, isReviewOwner, deleteReview);

export { router };
