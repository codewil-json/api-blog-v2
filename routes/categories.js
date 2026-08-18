const express = require('express');
const {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoriesController');

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', createCategory);
router.put('/:slug', updateCategory);
router.delete('/:slug', deleteCategory);

module.exports = router;
