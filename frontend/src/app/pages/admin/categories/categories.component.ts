import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  categoryForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  showForm = false;

  // Image handling
  imagePreview: string | ArrayBuffer | null = null;
  isDragging = false;

  constructor(
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // File Upload Handling matches ProductsComponent
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

  editMode = false;
  currentCategoryId: string | null = null;

  // ... (previous code)

  openAdd() {
    this.editMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showForm = true;
  }

  openEdit(category: any) {
    this.editMode = true;
    this.currentCategoryId = category._id;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description
    });

    if (category.image) {
      this.imagePreview = `http://localhost:5000${category.image}`;
    }

    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.editMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      const formData = new FormData();
      formData.append('name', this.categoryForm.get('name')?.value);

      const description = this.categoryForm.get('description')?.value;
      formData.append('description', description ? description : '');

      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      console.log('Submitting Category:', {
        editMode: this.editMode,
        id: this.currentCategoryId,
        name: formData.get('name'),
        description: formData.get('description')
      });

      const request = this.editMode && this.currentCategoryId
        ? this.categoryService.updateCategory(this.currentCategoryId, formData)
        : this.categoryService.createCategory(formData);

      request.subscribe({
        next: (res) => {
          console.log('Category saved successfully:', res);
          this.loadCategories();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error saving category:', err);
          alert('Failed to save category. See console for details.');
        }
      });
    }
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => console.error(err)
      });
    }
  }
}
