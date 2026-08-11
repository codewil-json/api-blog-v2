const Post = require('../models/Post');

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ _id: -1 });

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const {
      slug,
      title,
      description,
      category,
      date,
      readTime,
      tags,
      content
    } = req.body;

    const post = await Post.create({
      slug,
      title,
      description,
      category,
      date,
      readTime,
      tags,
      content
    });

    res.status(201).json(post);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'A post with this slug already exists'
      });
    }

    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const {
      title,
      description,
      category,
      date,
      readTime,
      tags,
      content
    } = req.body;

    const post = await Post.findOneAndUpdate(
      { slug },
      {
        title,
        description,
        category,
        date,
        readTime,
        tags,
        content
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOneAndDelete({ slug });

    if (!post) {
      return res.status(404).json({
        error: 'Post not found'
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
};