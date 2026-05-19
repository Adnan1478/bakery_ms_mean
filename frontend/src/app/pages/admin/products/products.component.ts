import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  productForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  showForm = false;
  editMode = false;
  currentProductId: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', Validators.required],
      weight: ['0.5 Kg', Validators.required],
      category: ['', Validators.required],
      stock: [0, Validators.required],
      status: ['active']
    });
  }

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error(err)
    });
  }

  imagePreview: string | ArrayBuffer | null = null;
  isDragging = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  handleFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  openEdit(product: any) {
    this.editMode = true;
    this.currentProductId = product._id;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      weight: product.weight || '0.5 Kg',
      category: product.category?._id || product.category || '',
      stock: product.stock,
      status: product.status
    });

    if (product.image) {
      this.imagePreview = `http://localhost:5000${product.image}`;
    }

    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.editMode = false;
    this.currentProductId = null;
    this.productForm.reset({ stock: 0, status: 'active' });
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData = new FormData();
      Object.keys(this.productForm.value).forEach(key => {
        formData.append(key, this.productForm.get(key)?.value);
      });

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      const request = this.editMode && this.currentProductId
        ? this.productService.updateProduct(this.currentProductId, formData)
        : this.productService.createProduct(formData);

      request.subscribe({
        next: () => {
          this.loadProducts();
          this.cancelEdit();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => this.loadProducts(),
        error: (err) => console.error(err)
      });
    }
  }
}
