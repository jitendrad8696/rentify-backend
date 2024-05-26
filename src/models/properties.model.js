import mongoose from "mongoose";

const { Schema, model } = mongoose;

const propertySchema = new Schema(
  {
    propertyType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    localArea: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    bedrooms: {
      type: Number,
      required: true,
      trim: true,
    },
    bathrooms: {
      type: Number,
      required: true,
      trim: true,
    },
    bachelorsAllowed: {
      type: Boolean,
      default: false,
    },
    nearbyRailwayStationDistance: {
      type: Number,
      required: true,
      trim: true,
    },
    nearbyHospitalDistance: {
      type: Number,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Property = model("Property", propertySchema);
