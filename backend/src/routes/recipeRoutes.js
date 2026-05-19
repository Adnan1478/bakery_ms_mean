const express = require('express');
const router = express.Router();
const {
    getRecipes,
    getRecipeById,
    getRecipeByProductId,
    createRecipe,
    updateRecipe,
    deleteRecipe,
} = require('../controllers/recipeController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

router.route('/')
    .get(getRecipes)
    .post(protect, staff, createRecipe);

router.route('/:id')
    .get(getRecipeById)
    .put(protect, staff, updateRecipe)
    .delete(protect, staff, deleteRecipe);

router.route('/product/:productId')
    .get(getRecipeByProductId);

module.exports = router;
