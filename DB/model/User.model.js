import mongoose, { Schema, model, Types } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: [true, "email must be unique value"],
      required: [true, "userName is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    phone: {
      type: String,
    },
    age: {
      type: Number,
    },
    image: { type: Object },
    coverImages:[ { type: Object }],
    code: {
      type: String,
      min: [6, "length must be 6 "],
      max: [6, "length must be 6 "],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    posts: [
      {
        type: Types.ObjectId,
        ref: "Post",
      },
    ],
    role: {
      type: String,
      default: "User",
      enum: ["User", "Admin"],
    },
    code: {
      type: String,
      expires: 900,
    },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", function () {
  this.firstName = this.name.split(" ")[0];
  this.lastName = this.name.split(" ")[1];
});
const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
