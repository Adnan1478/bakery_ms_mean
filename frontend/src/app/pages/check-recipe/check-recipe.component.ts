import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-check-recipe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './check-recipe.component.html',
  styleUrls: ['./check-recipe.component.css']
})
export class CheckRecipeComponent implements OnInit {
  recipe: any = null;
  product: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private productService: ProductService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadRecipe(id);
      }
    });
  }

  loadRecipe(id: string) {
    this.loading = true;
    this.recipeService.getRecipeById(id).subscribe({
      next: (data) => {
        this.recipe = data;
        this.product = data.product;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching recipe:', err);
        this.error = 'Recipe not found or you do not have permission to view it.';
        this.loading = false;
      }
    });
  }

  get instructionsList(): string[] {
    if (!this.recipe || !this.recipe.instructions) return [];
    // Split by newlines or periods followed by space/newline to mimic a list if it's a blob of text.
    // But based on the image, it looks like distinct steps.
    // If the user entered it as one block, we'll try to split intelligently.
    // A simple split by newline is safest if the user uses newlines.
    return this.recipe.instructions.split('\n').filter((line: string) => line.trim().length > 0);
  }
}
