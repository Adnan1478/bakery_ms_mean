import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = false;

  constructor(private userService: UserService, private toast: ToastService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.show('Failed to load users', 'error');
      }
    });
  }

  deleteUser(user: any) {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.toast.show('User deleted', 'success');
          this.loadUsers();
        },
        error: () => this.toast.show('Failed to delete user', 'error')
      });
    }
  }

  updateRole(user: any, event: any) {
    const newRole = event.target.value;
    if (confirm(`Are you sure you want to change ${user.name}'s role to ${newRole}?`)) {
      this.userService.updateUserRole(user._id, newRole).subscribe({
        next: () => {
          this.toast.show('User role updated successfully', 'success');
          this.loadUsers();
        },
        error: () => {
          this.toast.show('Failed to update user role', 'error');
          event.target.value = user.role; // Revert on error
        }
      });
    } else {
      event.target.value = user.role; // Revert if cancelled
    }
  }
}
