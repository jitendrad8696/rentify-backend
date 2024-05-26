import sendgridMail from "@sendgrid/mail";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { SENDGRID_FROM_EMAIL } from "../config/index.js";

const cookiesOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  maxAge: 86400000, // 24 hour
};

const clearCookiesOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

const generateRandomPassword = (length = 8) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, firstName, lastName, phoneNumber, userType, password } =
      req.body;

    // Validations
    if (!firstName || firstName.length < 3 || firstName.length > 20) {
      return next(
        new APIError(
          400,
          "First name is required and should be 3-20 characters long."
        )
      );
    }
    if (lastName && lastName.length > 20) {
      return next(
        new APIError(400, "Last name should not exceed 20 characters.")
      );
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      return next(new APIError(400, "Valid email is required."));
    }
    const phonePattern = /^\+\d{1,3}\s?\d{6,14}$/;
    if (!phoneNumber || !phonePattern.test(phoneNumber)) {
      return next(
        new APIError(
          400,
          "Valid phone number is required. Example: +918696958620"
        )
      );
    }
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!password || !passwordPattern.test(password)) {
      return next(
        new APIError(
          400,
          "Password must be at least 8 characters long and include one special character, one lowercase letter, one uppercase letter, and one numeric value."
        )
      );
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new APIError(400, "Email is already in use."));
    }

    const user = await User.create({
      email,
      firstName,
      lastName,
      phoneNumber,
      userType,
      password,
    });

    if (!user) {
      return next(new APIError(500, "User registration failed."));
    }

    const token = user.genAccessToken();

    res.cookie("token", token, cookiesOptions);

    res
      .status(201)
      .json(
        new APIResponse(201, "User registered successfully", { user, token })
      );
  } catch (error) {
    console.error("Error: User registration failed: ", error);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validations
    if (!email) {
      return next(new APIError(400, "Email is required."));
    }

    if (!password) {
      return next(new APIError(400, "Password is required."));
    }

    // Fetch user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User does not exist."));
    }

    // Validate password
    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return next(new APIError(400, "Invalid password."));
    }

    const token = user.genAccessToken();

    res.cookie("token", token, cookiesOptions);

    res
      .status(200)
      .json(
        new APIResponse(200, "User logged in successfully", { user, token })
      );
  } catch (error) {
    console.error("Error: User login failed: ", error);
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      return next(new APIError(400, "Valid email is required."));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User with this email does not exist."));
    }

    const randomPassword = generateRandomPassword();

    user.password = randomPassword;
    await user.save();

    const msg = {
      to: user.email,
      from: SENDGRID_FROM_EMAIL,
      subject: "Password Reset",
      text: `Your new password is:  ${randomPassword}\nPlease change your password after logging in.`,
    };

    // Send email
    await sendgridMail.send(msg);

    res.clearCookie("token", clearCookiesOptions);

    res
      .status(200)
      .json(new APIResponse(200, "Password reset email sent successfully"));
  } catch (error) {
    console.error("Error sending password reset email:", error);
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validations
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      return next(new APIError(400, "Valid email is required."));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new APIError(404, "User not found."));
    }

    if (!oldPassword || !newPassword) {
      return next(
        new APIError(400, "Both old and new passwords are required.")
      );
    }

    // Match old password
    const isMatch = await user.isPasswordValid(oldPassword);
    if (!isMatch) {
      return next(new APIError(401, "Invalid old password."));
    }

    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (!passwordPattern.test(newPassword)) {
      return next(
        new APIError(
          400,
          "New Password must be at least 8 characters long and include one special character, one lowercase letter, one uppercase letter, and one numeric value."
        )
      );
    }

    user.password = newPassword;
    await user.save();

    res.clearCookie("token", clearCookiesOptions);

    res.status(200).json(new APIResponse(200, "Password reset successfully."));
  } catch (error) {
    console.error("Error resetting password:", error);
    next(error);
  }
};

export const logoutUser = (req, res, next) => {
  try {
    res.clearCookie("token", clearCookiesOptions);

    res.status(200).json(new APIResponse(200, "User logged out successfully"));
  } catch (error) {
    console.error("Error logging out user:", error);
    next(
      new APIError(
        500,
        "An error occurred while logging out. Please try again later."
      )
    );
  }
};

export const getUser = async (req, res, next) => {
  try {
    const _id = req._id;

    if (!_id) {
      return next(new APIError(401, "Unauthorized access."));
    }

    const user = await User.findById(_id).select("-password");

    if (!user) {
      return next(new APIError(404, "User not found."));
    }

    res
      .status(200)
      .json(new APIResponse(200, "User fetched successfully.", user));
  } catch (error) {
    console.error("Error fetching user data:", error);
    next(error);
  }
};
