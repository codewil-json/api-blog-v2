const Category = require('../models/Category');
const Post = require('../models/Post');

const normalizeCategorySlug = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const trimmedName = String(name).trim();
    const slug = normalizeCategorySlug(trimmedName);

    if (!slug) {
      return res.status(400).json({ error: 'Category name is invalid' });
    }

    const category = await Category.create({
      name: trimmedName,
      slug
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { name } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const trimmedName = String(name).trim();
    const nextSlug = normalizeCategorySlug(trimmedName);

    if (!nextSlug) {
      return res.status(400).json({ error: 'Category name is invalid' });
    }

    const category = await Category.findOneAndUpdate(
      { slug },
      {
        name: trimmedName,
        slug: nextSlug
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const postCount = await Post.countDocuments({ category: category._id });

    if (postCount > 0) {
      return res.status(409).json({
        error: 'Cannot delete this category because it is assigned to one or more posts.'
      });
    }

    await Category.deleteOne({ _id: category._id });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
