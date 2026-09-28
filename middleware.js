import { Listing } from "./models/listing.js";
import { listingSchema,reviewSchema } from "./schema.js";
import { expressError } from "./utils/expressError.js";
import { Review } from "./models/review.js";

// Middleware to check user is Logged in or not.
export function isLoggedIn(req,res,next){
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","Please login to Proceed.");
        return res.redirect("/login");
    }
    next();
};

export function setRedirectUrl(req,res,next){
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
}

export function isNotLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/listings");
    }
    next();
}

// Middleware for Authorization
export async function isOwner(req,res,next){
    let {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error","You are not the owner of this page!");
        return res.redirect(`/listings/${id}`);
    }
    next()
}

export async function isReviewOwner(req,res,next){
    let{reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error","You are not the owner of this review!")
        return res.redirect(`/listings/${req.params.id}`);
    }
    next();
}

// Middleware for server side schema validation for listings
export function validateListing(req,res,next){
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }else{
        next();
    }
}

// Middleware for Server side Schema Validation of reviews
export function validateReview(req,res,next){
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }else{
        next();
    }
}