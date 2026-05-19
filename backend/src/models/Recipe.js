const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    ingredients: [String],
    instructions: {
        type: String,
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
