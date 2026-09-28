import { Listing } from "../models/listing.js";
import { Review } from "../models/review.js";
import wrapAsync from "../utils/wrapAsync.js";


export const postReview=wrapAsync(async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);

    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    req.flash("success","New review added.");
    res.redirect(`/listings/${id}`);
});

export const deleteReview=wrapAsync(async(req,res)=>{
    let {id,reviewId}=req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted.");
    res.redirect(`/listings/${id}`);
});
