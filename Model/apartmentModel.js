const mongoose = require("mongoose");

const apartmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: String,
      required: [true, "An apartment must have a location"],
    },
    price: {
      type: Number,
      required: [true, "An apartment must have a price"],
    },
    coverPhoto: {
      type: String,
       required: [true, "an apartment must have a cover photo"],
    },
    images: {
      type: [String],
      // required: [true, "upload images for apartment"],
      maxLength: [3, "upload 3 images only"],
    },
    propertyType: {
      type: String,
      required: [true, "An apartment must belong to a property type"],
    },
    numberOfPersons: {
      type: Number,
      required: [true, "Please enter the number of persons"],
    },
    numberOfBedrooms: {
      type: Number,
      required: [true, "enter number of bedrooms"],
    },
    apartmentSize: {
      type: Number,
      required: [true, "enter apartment size"],
    },
    yearsForRent: {
      type: Number,
      required: [true, "enter number of years"],
    },
    rating: {
      type: Number,
      required: [true, "a apartment must have a rating"],
    },
    bathroom: {
      type: Boolean,
      required: [true, "select whether the apartment have a bathroom or not"],
    },
    kitchen: {
      type: Boolean,
      required: [true, "select whether the apartment have a kitchen"],
    },
    toilet: {
      type: Boolean,
      required: [true, "select whether the apartment have a toilet facility"],
    },
    sharedMeter: {
      type: Boolean,
      required: [true, "select whether the apartment have a shared meter"],
    },
    waterAccess: {
      type: Boolean,
      required: [true, "select whether the apartment have access to water"],
    },
    summary: {
      type: String,
      required: [true, "give a summary of the apartment"],
      trim: true,
    },
    features: {
      type: String,
      required: [true, "enter the pricise features of the apartment"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "enter full description of the apartment"],
      minLength: [100, "a description must be at least 100 characters"],
      trim: true,
    },
    rented: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Apartment = mongoose.model("Apartment", apartmentSchema);
module.exports = Apartment;
