import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { RecipeService } from '../../services/recipe.service';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  product: any = null;
  loading = true;
  quantity = 1;

  // Recipe State
  recipe: any = null;
  hasRecipe = false;
  showRecipeModal = false;

  // New UI states
  weights = ['0.5 Kg', '1 Kg', '1.5 Kg', '2 Kg', '4 Kg'];
  selectedWeight = '0.5 Kg';
  cakeMessage = '';
  pincode = '';
  currentPrice = 0;

  // Image handling
  selectedImage: string = '';
  productImages: string[] = [];

  // Review State
  reviews: any[] = [];
  avgRating: number = 0;
  totalReviews: number = 0;
  canReviewStatus: boolean = false;
  eligibleOrderId: string | null = null;

  // Review Form
  reviewRating: number = 5;
  reviewComment: string = '';
  reviewImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  submittingReview: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private toast: ToastService,
    private authService: AuthService,
    private router: Router,
    private recipeService: RecipeService,
    private reviewService: ReviewService
  ) { }

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
      this.checkRecipe(productId);
      this.loadReviews(productId);
      if (this.authService.currentUserValue) {
        this.checkReviewEligibility(productId);
      }
    }
  }

  checkRecipe(productId: string) {
    this.recipeService.getRecipeByProductId(productId).subscribe({
      next: (data) => {
        if (data) {
          this.recipe = data;
          this.hasRecipe = true;
        }
      },
      error: (err) => console.log('No recipe found or error', err)
    });
  }

  loadProduct(id: string) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.currentPrice = this.product.price;

        // Handle images
        if (this.product.images && this.product.images.length > 0) {
          this.productImages = this.product.images;
        } else {
          this.productImages = [this.product.image];
        }
        this.selectedImage = this.productImages[0];

        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching product:', err);
        this.loading = false;
        this.toast.show('Failed to load product details', 'error');
      }
    });
  }

  addToCart() {
    if (!this.authService.currentUserValue) {
      this.toast.show('Please login to add items to cart', 'error');
      this.router.navigate(['/login']);
      return;
    }

    if (this.product) {
      const itemToAdd = {
        ...this.product,
        price: this.currentPrice,
        weight: this.selectedWeight
      };
      this.cartService.addToCart(itemToAdd);
      this.toast.show(`${this.product.name} (${this.selectedWeight}) added to cart!`, 'success');
    }
  }

  selectWeight(weight: string) {
    this.selectedWeight = weight;
    this.updatePrice();
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  updatePrice() {
    if (!this.product) return;

    const basePrice = this.product.price;
    const numericWeight = parseFloat(this.selectedWeight.split(' ')[0]);
    const multiplier = numericWeight / 0.5;

    // Linear calculation: Base * multiplier
    let calculatedPrice = basePrice * multiplier;

    // Apply progressive discount for bulk weights
    // "20-30 off" logic: deducting ~40 Rs for every extra 0.5kg unit added
    if (multiplier > 1) {
      const discountSteps = multiplier - 1;
      const discount = discountSteps * 40;
      calculatedPrice -= discount;
    }

    this.currentPrice = Math.round(calculatedPrice);
  }

  checkAvailability() {
    if (this.pincode.length === 6) {
      this.toast.show('Delivery available in your area!', 'success');
    } else {
      this.toast.show('Please enter a valid 6-digit pincode', 'error');
    }
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  loadReviews(productId: string) {
    this.reviewService.getProductReviews(productId).subscribe({
      next: (data) => {
        this.reviews = data.reviews;
        this.avgRating = data.avgRating;
        this.totalReviews = data.totalReviews;
      },
      error: (err) => console.log('Error loading reviews', err)
    });
  }

  checkReviewEligibility(productId: string) {
    this.reviewService.canReview(productId).subscribe({
      next: (data) => {
        this.canReviewStatus = data.canReview;
        this.eligibleOrderId = data.orderId;
      },
      error: (err) => console.log('Error checking review eligibility', err)
    });
  }

  setRating(stars: number) {
    this.reviewRating = stars;
  }

  onReviewImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.reviewImage = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  submitReview() {
    if (!this.reviewComment.trim()) {
      this.toast.show('Please write a review comment', 'error');
      return;
    }

    if (!this.eligibleOrderId || !this.product) return;

    this.submittingReview = true;
    const formData = new FormData();
    formData.append('productId', this.product._id);
    formData.append('orderId', this.eligibleOrderId);
    formData.append('rating', this.reviewRating.toString());
    formData.append('comment', this.reviewComment);
    if (this.reviewImage) {
      formData.append('image', this.reviewImage);
    }

    this.reviewService.addReview(formData).subscribe({
      next: (newReview) => {
        this.toast.show('Review submitted successfully!', 'success');
        this.submittingReview = false;
        this.canReviewStatus = false;

        // Optimistically add to DOM without reloading 
        this.reviews.unshift(newReview);
        this.totalReviews++;

        // Reset form
        this.reviewComment = '';
        this.reviewRating = 5;
        this.reviewImage = null;
        this.imagePreview = null;
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Failed to submit review', 'error');
        this.submittingReview = false;
      }
    });
  }
}
