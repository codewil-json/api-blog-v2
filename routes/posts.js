const express = require('express');
const {
  getPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postsController');

const router = express.Router();

router.get('/', getPosts);

router.get('/:slug', getPostBySlug);

router.post('/', createPost);

router.put('/:slug', updatePost);

router.delete('/:slug', deletePost);

module.exports = router;