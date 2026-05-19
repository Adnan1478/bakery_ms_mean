import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RecipeService } from '../../../services/recipe.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {
  recipes: any[] = [];
  products: any[] = [];
  recipeForm: FormGroup;
  loading = false;
  showForm = false;
  editMode = false;
  currentRecipeId: string | null = null;

  constructor(
    private recipeService: RecipeService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.recipeForm = this.fb.group({
      product: ['', Validators.required],
      instructions: ['', Validators.required],
      ingredients: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadRecipes();
    this.loadProducts();
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient() {
    this.ingredients.push(this.fb.control('', Validators.required));
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  loadRecipes() {
    this.loading = true;
    this.recipeService.getRecipes().subscribe({
      next: (data) => {
        this.recipes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => this.products = data,
      error: (err) => console.error(err)
    });
  }

  openEdit(recipe: any) {
    this.editMode = true;
    this.currentRecipeId = recipe._id;

    // Clear existing ingredients
    while (this.ingredients.length) {
      this.ingredients.removeAt(0);
    }

    // Add ingredients from recipe
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ing: any) => {
        const value = typeof ing === 'string' ? ing : `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim();
        this.ingredients.push(this.fb.control(value, Validators.required));
      });
    } else {
      // Add at least one empty ingredient row if none exist
      this.addIngredient();
    }

    this.recipeForm.patchValue({
      product: recipe.product?._id || recipe.product || '',
      instructions: recipe.instructions
    });

    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.editMode = false;
    this.currentRecipeId = null;
    this.recipeForm.reset();
    while (this.ingredients.length) {
      this.ingredients.removeAt(0);
    }
    // Add one empty ingredient row for next time
    this.addIngredient();
  }

  openCreate() {
    this.cancelEdit(); // Reset form
    this.showForm = true;
  }

  onSubmit() {
    if (this.recipeForm.valid) {
      const recipeData = this.recipeForm.value;
      console.log('Submitting Recipe:', recipeData);

      const request = this.editMode && this.currentRecipeId
        ? this.recipeService.updateRecipe(this.currentRecipeId, recipeData)
        : this.recipeService.createRecipe(recipeData);

      request.subscribe({
        next: () => {
          this.loadRecipes();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Recipe Save Error:', err);
          alert('Failed to save recipe: ' + (err.error?.message || err.message));
        }
      });
    } else {
      console.warn('Recipe form is invalid', this.recipeForm.errors);
      // Mark all fields as touched to show errors
      this.recipeForm.markAllAsTouched();
    }
  }

  deleteRecipe(id: string) {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.deleteRecipe(id).subscribe({
        next: () => this.loadRecipes(),
        error: (err) => console.error(err)
      });
    }
  }
}
