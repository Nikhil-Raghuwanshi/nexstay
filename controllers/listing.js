import { Listing } from "../models/listing.js";
import wrapAsync from "../utils/wrapAsync.js";
import mongoose from "mongoose";
import { expressError } from "../utils/expressError.js";

// For GeoCoding
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding.js";

const geocodingClient = mbxGeocoding({
  accessToken: process.env.MAP_TOKEN,
});

export const index = wrapAsync(async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

export const getNewListing = (req, res) => {
  res.render("listings/new.ejs");
};

export const postNewListing = wrapAsync(async (req, res) => {
  let geoCode = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
      types: [
        "country",
        "region",
        "district",
        "place",
        "locality",
        "neighborhood",
      ],
    })
    .send();

  if (!geoCode.body.features || geoCode.body.features.length === 0) {
    throw new expressError(400, "Invalid location.");
  }
  let newListing = req.body.listing;
  newListing.owner = req.user._id;

  const url = req.file.path;
  const filename = req.file.filename;
  newListing.image = { url, filename };

  newListing.geometry = geoCode.body.features[0].geometry;
  await Listing.create(newListing);
  req.flash("success", "New listing Added.");
  res.redirect("/listings");
});

export const showListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new expressError(404, "Page not found!");
  }
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exists.");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
});

export const getEditListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for doesn't exists.");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
});

export const postEditListing = wrapAsync(async (req, res) => {
  if (!req.body.listing) {
    throw new expressError(400, "Send valid data for listing");
  }
  let { id } = req.params;
  let updateData = { ...req.body.listing };

  if (req.file) {
    updateData.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }
  let geoCode = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  if (!geoCode.body.features || geoCode.body.features.length === 0) {
    throw new expressError(400, "Invalid location.");
  }
  updateData.geometry = geoCode.body.features[0].geometry;
  await Listing.findByIdAndUpdate(id, updateData, { runValidators: true });

  req.flash("success", "Listing updated.");
  res.redirect(`/listings/${id}`);
});

export const deleteListing = wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted.");
  res.redirect("/listings");
});

export const searchRoute = wrapAsync(async (req, res) => {
  const { location } = req.query;

  if (!location || location.trim() === "") {
    return res.redirect("/listings");
  }

  const searchLocation = location.trim();

  // Mapbox Geocoding
  const response = await geocodingClient
    .forwardGeocode({
      query: searchLocation,
      limit: 1,
      types: [
        "country",
        "region",
        "district",
        "place",
        "locality",
        "neighborhood",
      ],
    })
    .send();

  // Mapbox couldn't find the location
  if (!response.body.features || response.body.features.length === 0) {
    return res.render("listings/searchResults.ejs", {
      listings: [],
      searchLocation,
    });
  }

  // Get coordinates from Mapbox
  const [longitude, latitude] = response.body.features[0].geometry.coordinates;

  // Search nearby listings
  const listings = await Listing.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [longitude, latitude],
        },

        key: "geometry",
        distanceField: "distance",
        spherical: true,
        maxDistance: 50000,
        distanceMultiplier: 0.001,
      },
    },
    {
        $limit: 50,
    }
  ]);

  res.render("listings/searchResults.ejs", {
    listings,
    searchLocation,
  });
});
