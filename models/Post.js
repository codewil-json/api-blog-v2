const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    date: {
      type: String,
      required: true,
      trim: true
    },

    readTime: {
      type: String,
      required: true,
      trim: true
    },

    tags: {
      type: [String],
      required: true
    },

    content: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: false
  }
);

module.exports = mongoose.model('Post', postSchema);