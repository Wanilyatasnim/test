// Student Management System - Frontend JavaScript

class StudentManager {
    constructor() {
        this.currentEditId = null;
        this.students = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStudents();
        this.loadStats();
    }

    bindEvents() {
        // Modal controls
        document.getElementById('addStudentBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('closeDeleteModal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.closeDeleteModal());

        // Form submission
        document.getElementById('studentForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('clearSearch').addEventListener('click', () => this.clearSearch());

        // Delete confirmation
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());

        // Close modals when clicking outside
        document.getElementById('studentModal').addEventListener('click', (e) => {
            if (e.target.id === 'studentModal') this.closeModal();
        });
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') this.closeDeleteModal();
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDeleteModal();
            }
        });
    }

    async loadStudents() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/students');
            const data = await response.json();
            
            if (response.ok) {
                this.students = data.students;
                this.renderStudents(this.students);
            } else {
                this.showToast('Error loading students: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            if (response.ok) {
                document.getElementById('totalStudents').textContent = data.total || 0;
                document.getElementById('activeStudents').textContent = data.active || 0;
                document.getElementById('inactiveStudents').textContent = data.inactive || 0;
                document.getElementById('totalCourses').textContent = data.courses?.length || 0;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    renderStudents(students) {
        const tbody = document.getElementById('studentsTableBody');
        const noResults = document.getElementById('noResults');
        const table = document.getElementById('studentsTable');

        if (students.length === 0) {
            tbody.innerHTML = '';
            table.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        noResults.style.display = 'none';

        tbody.innerHTML = students.map(student => `
            <tr>
                <td><strong>${student.student_id}</strong></td>
                <td>${student.first_name} ${student.last_name}</td>
                <td>${student.email}</td>
                <td>${student.phone || 'N/A'}</td>
                <td>${student.course || 'N/A'}</td>
                <td>
                    <span class="status-badge status-${student.status.toLowerCase()}">
                        ${student.status}
                    </span>
                </td>
                <td>${this.formatDate(student.enrollment_date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-edit" onclick="studentManager.editStudent(${student.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-delete" onclick="studentManager.deleteStudent(${student.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    openAddModal() {
        this.currentEditId = null;
        document.getElementById('modalTitle').textContent = 'Add New Student';
        document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Save Student';
        this.resetForm();
        this.showModal();
    }

    async editStudent(id) {
        try {
            const response = await fetch(`/api/students/${id}`);
            const data = await response.json();
            
            if (response.ok) {
                this.currentEditId = id;
                document.getElementById('modalTitle').textContent = 'Edit Student';
                document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Update Student';
                this.populateForm(data.student);
                this.showModal();
            } else {
                this.showToast('Error loading student: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error: ' + error.message, 'error');
        }
    }

    populateForm(student) {
        document.getElementById('studentId').value = student.student_id || '';
        document.getElementById('firstName').value = student.first_name || '';
        document.getElementById('lastName').value = student.last_name || '';
        document.getElementById('email').value = student.email || '';
        document.getElementById('phone').value = student.phone || '';
        document.getElementById('dateOfBirth').value = student.date_of_birth || '';
        document.getElementById('gender').value = student.gender || '';
        document.getElementById('address').value = student.address || '';
        document.getElementById('course').value = student.course || '';
        document.getElementById('status').value = student.status || 'Active';
    }

    resetForm() {
        document.getElementById('studentForm').reset();
        document.getElementById('status').value = 'Active';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const studentData = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!studentData.student_id || !studentData.first_name || !studentData.last_name || !studentData.email) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const url = this.currentEditId ? `/api/students/${this.currentEditId}` : '/api/students';
            const method = this.currentEditId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast(
                    this.currentEditId ? 'Student updated successfully!' : 'Student added successfully!',
                    'success'
                );
                this.closeModal();
                this.loadStudents();
                this.loadStats();
            } else {
                this.showToast('Error: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error: ' + error.message, 'error');
        }
    }

    deleteStudent(id) {
        this.currentDeleteId = id;
        document.getElementById('deleteModal').classList.add('show');
    }

    async confirmDelete() {
        if (!this.currentDeleteId) return;

        try {
            const response = await fetch(`/api/students/${this.currentDeleteId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showToast('Student deleted successfully!', 'success');
                this.closeDeleteModal();
                this.loadStudents();
                this.loadStats();
            } else {
                this.showToast('Error deleting student: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error: ' + error.message, 'error');
        }
    }

    async handleSearch(e) {
        const searchTerm = e.target.value.trim();
        
        if (searchTerm === '') {
            this.renderStudents(this.students);
            return;
        }

        if (searchTerm.length < 2) return;

        try {
            const response = await fetch(`/api/students/search/${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            
            if (response.ok) {
                this.renderStudents(data.students);
            } else {
                this.showToast('Search error: ' + data.error, 'error');
            }
        } catch (error) {
            this.showToast('Network error: ' + error.message, 'error');
        }
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        this.renderStudents(this.students);
    }

    showModal() {
        document.getElementById('studentModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('studentModal').classList.remove('show');
        document.body.style.overflow = 'auto';
        this.currentEditId = null;
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('show');
        this.currentDeleteId = null;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const table = document.getElementById('studentsTable');
        
        if (show) {
            loading.style.display = 'block';
            table.style.display = 'none';
        } else {
            loading.style.display = 'none';
            table.style.display = 'table';
        }
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                     type === 'error' ? 'fa-exclamation-circle' : 
                     'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${icon} toast-icon"></i>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
        
        // Remove on click
        toast.addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.studentManager = new StudentManager();
});

// Handle page refresh/reload
window.addEventListener('beforeunload', () => {
    document.body.style.overflow = 'auto';
});