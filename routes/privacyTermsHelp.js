import express from "express";
import { privacyRouter,termsRouter,helpRouter } from "../controllers/privacyTermsHelp.js";

const router = express.Router({ mergeParams: true });

router.get("/privacy",privacyRouter);
router.get("/terms",termsRouter);
router.get("/help",helpRouter);

export { router };
