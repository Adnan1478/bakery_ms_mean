const Recipe = require('../models/Recipe');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find().populate('product'); // Populate product details including image/name

        // Fix image paths for Windows compatibility if product has image
        const validRecipes = recipes.map(recipe => {
            const r = recipe.toObject();
            if (r.product && r.product.image) {
                r.product.image = r.product.image.replace(/\\/g, '/');
            }
            return r;
        });

        res.json(validRecipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recipe by ID
// @route   GET /api/recipes/:id
// @access  Public
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('product');

        if (recipe) {
            const r = recipe.toObject();
            if (r.product && r.product.image) {
                r.product.image = r.product.image.replace(/\\/g, '/');
            }
            res.json(r);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recipe by Product ID
// @route   GET /api/recipes/product/:productId
// @access  Public
const getRecipeByProductId = async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ product: req.params.productId }).populate('product');

        if (recipe) {
            const r = recipe.toObject();
            if (r.product && r.product.image) {
                r.product.image = r.product.image.replace(/\\/g, '/');
            }
            res.json(r);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a recipe
// @route   POST /api/recipes
// @access  Private/Admin
const createRecipe = async (req, res) => {
    try {
        console.log('Create Recipe Body:', req.body);
        const { product, ingredients, instructions } = req.body;

        const recipe = new Recipe({
            product,
            ingredients,
            instructions,
        });

        const createdRecipe = await recipe.save();
        res.status(201).json(createdRecipe);
    } catch (error) {
        console.error('Create Recipe Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin
const updateRecipe = async (req, res) => {
    try {
        const { product, ingredients, instructions } = req.body;
        const recipe = await Recipe.findById(req.params.id);

        if (recipe) {
            recipe.product = product || recipe.product;
            recipe.ingredients = ingredients || recipe.ingredients;
            recipe.instructions = instructions || recipe.instructions;

            const updatedRecipe = await recipe.save();
            res.json(updatedRecipe);
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin
const deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (recipe) {
            await recipe.deleteOne();
            res.json({ message: 'Recipe removed' });
        } else {
            res.status(404).json({ message: 'Recipe not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRecipes,
    getRecipeById,
    getRecipeByProductId,
    createRecipe,
    updateRecipe,
    deleteRecipe,
};
