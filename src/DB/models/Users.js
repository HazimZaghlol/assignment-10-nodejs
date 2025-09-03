import mongoose from "mongoose";
import { GenderEnum, RoleEnum } from "../../Common/enums/user.enum.js";

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must be less than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: { unique: true, name: "email_unique_index" },
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [128, "Password must be less than 128 characters"],
    },
    phone: {
      type: String,
      trim: true,
      minlength: [8, "Phone must be at least 8 digits"],
      maxlength: [200],
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      required: [true, "Gender is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [13, "Minimum age is 13"],
      max: [100, "Maximum age is 100"],
    },
    otps: {
      confirmation: {
        type: String,
        default: null,
      },
      resetPassword: {
        type: String,
        default: null,
      },
      resetPasswordExpires: {
        type: Date,
        default: null,
      },
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    profileImageLocal: {
      type: String,
      default: null,
    },
    profileImageHosted: {
      secure_url: { type: String, default: null },
      public_id: { type: String, default: null },
    },
    deletedAt: { type: Date, default: null },
    devices: [
      {
        deviceId: { type: String, required: true },
        lastLogin: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,

    methods: {
      getFullName() {
        return `${this.firstName} ${this.lastName}`;
      },
    },

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },

    virtuals: {
      fullName: {
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
      },
    },
  }
);

UserSchema.virtual("Messages", {
  ref: "Message",
  localField: "_id",
  foreignField: "receiverId",
});

export const User = mongoose.model("User", UserSchema);
