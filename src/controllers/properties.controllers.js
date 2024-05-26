import { Property } from "../models/properties.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { SENDGRID_FROM_EMAIL } from "../config/index.js";
import { User } from "../models/user.model.js";
import sendgridMail from "@sendgrid/mail";

export const postProperty = async (req, res, next) => {
  try {
    const {
      propertyType,
      title,
      state,
      city,
      localArea,
      bedrooms,
      bathrooms,
      bachelorsAllowed,
      nearbyRailwayStationDistance,
      nearbyHospitalDistance,
      price,
    } = req.body;

    // Validate input
    const errors = {};
    if (!propertyType) errors.propertyType = "Property type is required.";
    if (!title) errors.title = "Title is required.";
    if (!state) errors.state = "State is required.";
    if (!city) errors.city = "City is required.";
    if (!localArea) errors.localArea = "Local Area is required.";
    if (!bedrooms) errors.bedrooms = "Number of bedrooms is required.";
    else if (isNaN(bedrooms))
      errors.bedrooms = "Number of bedrooms must be a number.";
    if (!bathrooms) errors.bathrooms = "Number of bathrooms is required.";
    else if (isNaN(bathrooms))
      errors.bathrooms = "Number of bathrooms must be a number.";
    if (!nearbyRailwayStationDistance)
      errors.nearbyRailwayStationDistance =
        "Nearby railway station's distance is required.";
    if (!nearbyHospitalDistance)
      errors.nearbyHospitalDistance = "Nearby hospital's distance is required.";
    if (!price) errors.price = "Price is required.";
    else if (isNaN(price)) errors.price = "Price must be a number.";

    if (Object.keys(errors).length > 0) {
      return next(new APIError(400, "Input Validation Errors", errors));
    }

    const owner = req._id;

    // Create new property
    const newProperty = new Property({
      propertyType,
      title,
      state,
      city,
      localArea,
      bedrooms,
      bathrooms,
      bachelorsAllowed,
      nearbyRailwayStationDistance,
      nearbyHospitalDistance,
      price,
      owner,
    });

    await newProperty.save();

    if (!newProperty) {
      return next(new APIError(500, "Failed to add property."));
    }

    res
      .status(201)
      .json(new APIResponse(201, "Property Added Successfully", newProperty));
  } catch (error) {
    console.error("Error posting property:", error);
    next(
      new APIError(500, "An error occurred while posting the property.", error)
    );
  }
};

export const getProperties = async (req, res, next) => {
  try {
    const userId = req._id;
    const properties = await Property.find({ owner: userId });
    res
      .status(200)
      .json(new APIResponse(200, "List of Properties", properties));
  } catch (error) {
    console.error("Error fetching properties:", error);
    next(new Error("An error occurred while fetching properties.", error));
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new APIError(404, "Property not found"));
    }

    // Check if user is the owner of the property
    if (property.owner.toString() !== req._id) {
      return next(
        new APIError(403, "You are not authorized to delete this property")
      );
    }

    await Property.deleteOne({ _id: propertyId });

    res.status(201).json(new APIResponse(201, "Property deleted successfully"));
  } catch (error) {
    console.error("Error deleting property:", error);
    next(new APIError(500, "An error occurred while deleting the property"));
  }
};

export const getPropertyById = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    console.log(`Fetching property with ID: ${propertyId}`);
    const property = await Property.findById(propertyId).select(
      "-createdAt -likes -owner -updatedAt -__v -_id"
    );
    if (!property) {
      return next(new APIError(404, "Property not found"));
    }
    res
      .status(200)
      .json(new APIResponse(200, "Property Details Found", property));
  } catch (error) {
    console.error("Error fetching property:", error);
    next(new APIError(500, "Error fetching property:", error));
  }
};

export const updatePropertyById = async (req, res, next) => {
  try {
    const propertyId = req.params.id;
    const updatedData = req.body;

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedProperty) {
      return next(new APIError(404, "Property not found"));
    }

    res
      .status(200)
      .json(
        new APIResponse(200, "Property updated successfully", updatedProperty)
      );
  } catch (error) {
    console.error("Error updating property:", error);
    next(new APIError(500, "Error updating property:", error));
  }
};

export const filterProperties = async (req, res) => {
  try {
    const {
      propertyType,
      state,
      city,
      bedrooms,
      bathrooms,
      bachelorsAllowed,
      minPrice,
      maxPrice,
    } = req.body;

    // Validate required fields
    if (!propertyType || !state || !city) {
      return next(
        new APIError(400, "Property type, state, and city are required fields.")
      );
    }

    const query = {
      propertyType,
      state,
      city,
    };

    if (bedrooms) query.bedrooms = bedrooms;
    if (bathrooms) query.bathrooms = bathrooms;
    if (typeof bachelorsAllowed === "boolean")
      query.bachelorsAllowed = bachelorsAllowed;

    if (minPrice) query.price = { ...query.price, $gte: minPrice };
    if (maxPrice) query.price = { ...query.price, $lte: maxPrice };

    const properties = await Property.find(query).populate(
      "owner",
      "email firstName lastName phoneNumber"
    );

    return res
      .status(200)
      .json(
        new APIResponse(200, "Properties According to filters", properties)
      );
  } catch (error) {
    console.error("Error fetching properties:", error);
    return next(
      new APIError(500, "An error occurred while fetching properties.", error)
    );
  }
};

export const sendOwnerInfo = async (req, res, next) => {
  const { propertyId, buyerId } = req.body;

  try {
    const property = await Property.findById(propertyId).populate("owner");
    const buyer = await User.findById(buyerId);

    if (!property || !buyer) {
      return next(new APIError(404, "Property or buyer not found"));
    }

    // Send email to the buyer
    const buyerMsg = {
      to: buyer.email,
      from: SENDGRID_FROM_EMAIL,
      subject: "Property Owner Information",
      text: `Hello ${buyer.firstName},

You have requested the owner details for the property titled "${property.title}". Here are the details:

Owner Name: ${property.owner.firstName} ${property.owner.lastName}
Email: ${property.owner.email}
Phone: ${property.owner.phoneNumber}

Thank you,
RENTIFY`,
    };

    await sendgridMail.send(buyerMsg);

    // Send email to the owner
    const ownerMsg = {
      to: property.owner.email,
      from: SENDGRID_FROM_EMAIL,
      subject: "Interested Buyer Information",
      text: `Hello ${property.owner.firstName},

A buyer is interested in your property titled "${property.title}". Here are the details of the buyer:

Buyer Name: ${buyer.firstName} ${buyer.lastName}
Email: ${buyer.email}
Phone: ${buyer.phoneNumber}

Thank you,
RENTIFY`,
    };

    await sendgridMail.send(ownerMsg);

    res
      .status(200)
      .json(new APIResponse(200, "Owner and buyer info sent via email"));
  } catch (error) {
    console.error("Error sending email:", error);
    next(new APIError(500, "Error sending email", error));
  }
};

export const toggleLikeProperty = async (req, res, next) => {
  const { propertyId, userId } = req.body;

  try {
    const property = await Property.findById(propertyId);
    const user = await User.findById(userId);

    if (!property || !user) {
      return next(404, "Property or user not found");
    }

    const propertyIndex = user.likes.indexOf(propertyId);
    const userIndex = property.likes.indexOf(userId);

    if (propertyIndex > -1 && userIndex > -1) {
      // Unlike
      user.likes.splice(propertyIndex, 1);
      property.likes.splice(userIndex, 1);
      await user.save();
      await property.save();
      res
        .status(200)
        .json(new APIResponse(200, "Removed from watchlist", property));
    } else {
      // Like
      user.likes.push(propertyId);
      property.likes.push(userId);
      await user.save();
      await property.save();
      res
        .status(200)
        .json(new APIResponse(200, "Added to watchlist", property));
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    next(new APIError(500, "Failed to toggle like", error));
  }
};

export const getWatchlist = async (req, res, next) => {
  try {
    const userId = req._id;
    const buyer = await User.findById(userId).populate("likes");
    console.log(buyer.likes);
    res.status(200).json(new APIResponse(200, "Your Watchlist", buyer.likes));
  } catch (error) {
    console.error("Error fetching properties:", error);
    next(
      new APIError(500, "An error occurred while fetching properties.", error)
    );
  }
};
