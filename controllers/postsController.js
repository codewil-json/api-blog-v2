const mongoose = require('mongoose');
const Post = require('../models/Post');
const Category = require('../models/Category');

const normalizeCategoryValue = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const resolveCategoryId = async (categoryValue) => {
  if (!categoryValue) {
    return null;
  }

  if (mongoose.isValidObjectId(categoryValue)) {
    const category = await Category.findById(categoryValue);
    return category ? category._id : null;
  }

  const normalizedValue = normalizeCategoryValue(categoryValue);

  if (!normalizedValue) {
    return null;
  }

  const category = await Category.findOne({
    $or: [
      { slug: normalizedValue },
      { name: { $regex: `^${normalizedValue.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' } }
    ]
  });

  return category ? category._id : null;
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate('category', 'name slug').sort({ _id: -1 });

    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug }).populate('category', 'name slug');

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

    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const categoryId = await resolveCategoryId(category);

    if (!categoryId) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const post = await Post.create({
      slug,
      title,
      description,
      category: categoryId,
      date,
      readTime,
      tags,
      content
    });

    const populatedPost = await Post.findById(post._id).populate('category', 'name slug');

    res.status(201).json(populatedPost);
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

    const categoryId = category ? await resolveCategoryId(category) : undefined;

    if (category && !categoryId) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updatedData = {
      title,
      description,
      date,
      readTime,
      tags,
      content
    };

    if (categoryId) {
      updatedData.category = categoryId;
    }

    const post = await Post.findOneAndUpdate(
      { slug },
      updatedData,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name slug');

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