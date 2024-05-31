import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "title is required"],
    minLength: [4, "title must be atleast 4 characters"],
    maxLength: [80, "title can not exceed 80 characters"],
  },
  description: {
    type: String,
    required: [true, "title is required"],
    minLength: [4, "description must be atleast 4 characters"],
  },
  lectures: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      video: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    },
  ],
  poster: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  numOfVideos: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    required: true,
  },
  numOfVideos: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Course = mongoose.model("Course", schema);
