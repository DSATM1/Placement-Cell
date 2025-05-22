const API_BASE_URL = 'http://localhost:1998/api';
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user')) || {};

const navLinks = {
    student: [
        { href: 'student-dashboard.html', text: 'Dashboard' },
        { href: 'student-profile.html', text: 'Profile' },
        { href: 'resume-builder.html', text: 'Resume Builder' },
        { href: 'events.html', text: 'Events' },
        { href: 'notifications.html', text: 'Notifications' },
        { href: 'index.html', text: 'Logout', onclick: 'logout()' }
    ],
    recruiter: [
        { href: 'recruiter-dashboard.html', text: 'Dashboard' },
        { href: 'post-job.html', text: 'Post Job' },
        { href: 'events.html', text: 'Events' },
        { href: 'index.html', text: 'Logout', onclick: 'logout()' }
    ],
    admin: [
        { href: 'admin-dashboard.html', text: 'Dashboard' },
        { href: 'manage-students.html', text: 'Manage Students' },
        { href: 'manage-recruiters.html', text: 'Manage Recruiters' },
        { href: 'manage-jobs.html', text: 'Manage Jobs' },
        { href: 'reports.html', text: 'Reports' },
        { href: 'index.html', text: 'Logout', onclick: 'logout()' }
    ],
    guest: [
        { href: 'index.html', text: 'Home' },
        { href: 'about.html', text: 'About' },
        { href: 'companies.html', text: 'Companies' },
        { href: 'contact.html', text: 'Contact' },
        { href: 'login.html', text: 'Login' },
        { href: 'register.html', text: 'Register' }
    ]
};

function toggleMenu() {
    const nav = document.getElementById('navbarNav');
    if (nav) nav.classList.toggle('show');
}

function showToast(message, type) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.querySelector('.toast-body').textContent = message;
    toastEl.classList.remove('hide', 'bg-success', 'bg-danger');
    toastEl.classList.add(type === 'success' ? 'bg-success' : 'bg-danger', 'text-white');
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function renderNav() {
    const nav = document.getElementById('navbarNav');
    if (!nav) return;
    const role = user.role || 'guest';
    const ul = nav.querySelector('ul.navbar-nav');
    ul.innerHTML = navLinks[role].map(link => 
        `<li class="nav-item"><a class="nav-link" href="${link.href}" ${link.onclick ? `onclick="${link.onclick}"` : ''}>${link.text}</a></li>`
    ).join('');
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'API error');
    return data;
}

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function checkPasswordStrength(password, meterId) {
    const meter = document.getElementById(meterId);
    if (!meter) return;
    meter.className = 'password-strength-meter';
    if (password.length < 8) {
        meter.classList.add('strength-weak');
    } else if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^A-Za-z0-9]/)) {
        meter.classList.add('strength-strong');
    } else {
        meter.classList.add('strength-medium');
    }
}

function showForm(role) {
    const forms = ['studentForm', 'recruiterForm', 'adminForm'];
    const tabs = ['studentTab', 'recruiterTab', 'adminTab'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) form.style.display = formId === `${role}Form` ? 'block' : 'none';
    });
    tabs.forEach(tabId => {
        const tab = document.getElementById(tabId);
        if (tab) tab.classList.toggle('active', tabId === `${role}Tab`);
    });
}

function validateForm(form) {
    form.classList.add('was-validated');
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    if (form.id === 'studentForm') {
        const usn = form.querySelector('#studentUSN').value;
        if (!/^[0-9A-Z]{10}$/.test(usn)) {
            form.querySelector('#studentUSN').classList.add('is-invalid');
            isValid = false;
        }
        const phone = form.querySelector('#studentPhone').value;
        if (!/^\d{10}$/.test(phone)) {
            form.querySelector('#studentPhone').classList.add('is-invalid');
            isValid = false;
        }
    } else if (form.id === 'recruiterForm') {
        const website = form.querySelector('#companyWebsite').value;
        if (!/^https?:\/\/.+/.test(website)) {
            form.querySelector('#companyWebsite').classList.add('is-invalid');
            isValid = false;
        }
        const phone = form.querySelector('#recruiterPhone').value;
        if (!/^\d{10}$/.test(phone)) {
            form.querySelector('#recruiterPhone').classList.add('is-invalid');
            isValid = false;
        }
    } else if (form.id === 'adminForm') {
        const email = form.querySelector('#adminEmail').value;
        if (!/@dsatm\.edu\.in$/.test(email)) {
            form.querySelector('#adminEmail').classList.add('is-invalid');
            isValid = false;
        }
        const phone = form.querySelector('#adminPhone').value;
        if (!/^\d{10}$/.test(phone)) {
            form.querySelector('#adminPhone').classList.add('is-invalid');
            isValid = false;
        }
        const adminCode = form.querySelector('#adminCode').value;
        if (adminCode !== 'DSATM_ADMIN_2025') {
            form.querySelector('#adminCode').classList.add('is-invalid');
            isValid = false;
        }
    } else if (form.id === 'addJobForm') {
        const deadline = form.querySelector('#deadline').value;
        if (new Date(deadline) < new Date()) {
            form.querySelector('#deadline').classList.add('is-invalid');
            isValid = false;
        }
    }

    const password = form.querySelector(`#${form.id.replace('Form', 'Password')}`)?.value;
    const confirmPassword = form.querySelector(`#${form.id.replace('Form', 'ConfirmPassword')}`)?.value;
    if (password && confirmPassword && password !== confirmPassword) {
        form.querySelector(`#${form.id.replace('Form', 'ConfirmPassword')}`).classList.add('is-invalid');
        isValid = false;
    }
    if (password && password.length < 8) {
        form.querySelector(`#${form.id.replace('Form', 'Password')}`).classList.add('is-invalid');
        isValid = false;
    }

    return isValid;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function exportJobs(format) {
    if (format !== 'csv') return;
    fetchAPI('/jobs').then(data => {
        const jobs = data.jobs;
        const headers = ['Title,Company,Job Type,Location,Status,Deadline,Salary,Eligibility,Applicants'];
        const rows = jobs.map(job => 
            `${job.title},${job.company},${job.jobType},${job.location},${job.status},${job.deadline},${job.salary || ''},${job.eligibility},${job.applicants.length}`
        );
        const csv = [...headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jobs.csv';
        a.click();
        URL.revokeObjectURL(url);
    }).catch(err => showToast(err.message, 'error'));
}

function initRegister() {
    const forms = ['studentForm', 'recruiterForm', 'adminForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateForm(form)) return;

            const role = formId.replace('Form', '');
            let body = {};
            
            if (role === 'student') {
                body = {
                    role: 'student',
                    email: form.querySelector('#studentEmail').value,
                    password: form.querySelector('#studentPassword').value,
                    name: form.querySelector('#studentName').value,
                    cgpa: 8.0
                };
            } else if (role === 'recruiter') {
                body = {
                    role: 'recruiter',
                    email: form.querySelector('#recruiterEmail').value,
                    password: form.querySelector('#recruiterPassword').value,
                    companyName: form.querySelector('#companyName').value
                };
            } else if (role === 'admin') {
                body = {
                    role: 'admin',
                    email: form.querySelector('#adminEmail').value,
                    password: form.querySelector('#adminPassword').value,
                    name: form.querySelector('#adminName').value
                };
            }

            try {
                const data = await fetchAPI('/auth/register', 'POST', body);
                token = data.token;
                user = data.user;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                showToast('Registration successful', 'success');
                setTimeout(() => {
                    window.location.href = {
                        student: 'student-dashboard.html',
                        recruiter: 'recruiter-dashboard.html',
                        admin: 'admin-dashboard.html'
                    }[role];
                }, 1000);
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    });
}

function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const role = form.role.value;
        const email = form.email.value;
        const password = form.password.value;
        try {
            const data = await fetchAPI('/auth/login', 'POST', { role, email, password });
            token = data.token;
            user = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            showToast('Login successful', 'success');
            setTimeout(() => {
                window.location.href = {
                    student: 'student-dashboard.html',
                    recruiter: 'recruiter-dashboard.html',
                    admin: 'admin-dashboard.html'
                }[role];
            }, 1000);
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

function initStudentDashboard() {
    const jobList = document.getElementById('jobList');
    const notificationList = document.getElementById('notificationList');
    if (!jobList || !notificationList) return;
    fetchAPI('/jobs').then(data => {
        jobList.innerHTML = data.jobs.map(job => `
            <div class="card">
                <h4 class="font-poppins">${job.title}</h4>
                <p>Company: ${job.company}</p>
                <p>Deadline: ${formatDate(job.deadline)}</p>
                <p>Eligibility: ${job.eligibility}</p>
            </div>
        `).join('');
    }).catch(err => showToast(err.message, 'error'));
    fetchAPI('/notifications').then(notifications => {
        notificationList.innerHTML = notifications.map(n => `
            <div class="card">
                <p>${n.message}</p>
                <p class="text-sm text-gray-500">${new Date(n.date).toLocaleString()}</p>
            </div>
        `).join('');
    }).catch(err => showToast(err.message, 'error'));
}

function initRecruiterDashboard() {
    const jobList = document.getElementById('jobList');
    if (!jobList) return;
    fetchAPI('/jobs/my-jobs').then(data => {
        jobList.innerHTML = data.jobs.map(job => `
            <div class="card">
                <h4 class="font-poppins">${job.title}</h4>
                <p>Company: ${job.company}</p>
                <p>Status: ${job.status}</p>
                <p>Deadline: ${formatDate(job.deadline)}</p>
            </div>
        `).join('');
    }).catch(err => showToast(err.message, 'error'));
}

function initPostJob() {
    const form = document.getElementById('jobForm');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = {
            title: form.title.value,
            company: form.company.value,
            deadline: form.deadline.value,
            eligibility: form.eligibility.value
        };
        try {
            await fetchAPI('/jobs', 'POST', body);
            showToast('Job posted successfully', 'success');
            form.reset();
        } catch (err) {
            showToast(err.message, 'error');
        }
    });
}

function initManageJobs() {
    const jobTableBody = document.getElementById('jobTableBody');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const companyFilter = document.getElementById('companyFilter');
    const resetFilters = document.getElementById('resetFilters');
    const addJobForm = document.getElementById('addJobForm');
    const saveJobBtn = document.getElementById('saveJobBtn');
    const pagination = document.getElementById('pagination');
    const currentItems = document.getElementById('currentItems');
    const totalItems = document.getElementById('totalItems');
    if (!jobTableBody || !emptyState) return;

    let jobs = [];
    let filteredJobs = [];
    const itemsPerPage = 10;
    let currentPage = 1;

    function populateCompanyFilter(jobs) {
        const companies = [...new Set(jobs.map(job => job.company))].sort();
        companyFilter.innerHTML = '<option value="">All Companies</option>' + 
            companies.map(company => `<option value="${company}">${company}</option>`).join('');
    }

    function renderJobs(page = 1) {
        currentPage = page;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedJobs = filteredJobs.slice(start, end);

        jobTableBody.innerHTML = paginatedJobs.map(job => `
            <tr data-job-id="${job._id}">
                <td>
                    <div class="job-title">${job.title}</div>
                    <small class="text-muted">${job.jobType} • ${job.location}</small>
                </td>
                <td>
                    <div class="company-name">
                        <img src="/api/placeholder/30/30" alt="${job.company}" class="company-logo">
                        ${job.company}
                    </div>
                </td>
                <td>${formatDate(job.deadline)}</td>
                <td>
                    <span class="status-badge status-${job.status}">
                        ${capitalizeFirstLetter(job.status)}
                    </span>
                </td>
                <td>
                    <span class="badge bg-secondary">${job.applicants.length}</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn btn-sm btn-view view-job-btn" data-job-id="${job._id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-edit edit-job-btn" data-job-id="${job._id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <div class="dropdown d-inline-block">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item approve-job-btn" href="#" data-job-id="${job._id}"><i class="fas fa-check text-success"></i> Approve</a></li>
                                <li><a class="dropdown-item reject-job-btn" href="#" data-job-id="${job._id}"><i class="fas fa-times text-danger"></i> Reject</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item delete-job-btn" href="#" data-job-id="${job._id}"><i class="fas fa-trash text-danger"></i> Delete</a></li>
                            </ul>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
        emptyState.classList.toggle('d-none', paginatedJobs.length > 0);
        updatePagination();
        currentItems.textContent = `${start + 1}-${Math.min(end, filteredJobs.length)}`;
        totalItems.textContent = filteredJobs.length;
    }

    function updatePagination() {
        const pageCount = Math.ceil(filteredJobs.length / itemsPerPage);
        pagination.innerHTML = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Previous" onclick="renderJobs(${currentPage - 1})">
                    <span aria-hidden="true">«</span>
                </a>
            </li>
            ${Array.from({ length: pageCount }, (_, i) => `
                <li class="page-item ${currentPage === i + 1 ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="renderJobs(${i + 1})">${i + 1}</a>
                </li>
            `).join('')}
            <li class="page-item ${currentPage === pageCount ? 'disabled' : ''}">
                <a class="page-link" href="#" aria-label="Next" onclick="renderJobs(${currentPage + 1})">
                    <span aria-hidden="true">»</span>
                </a>
            </li>
        `;
    }

    function filterJobs() {
        const search = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        const company = companyFilter.value;

        filteredJobs = jobs.filter(job => 
            (!search || job.title.toLowerCase().includes(search) || job.company.toLowerCase().includes(search)) &&
            (!status || job.status === status) &&
            (!company || job.company === company)
        );
        renderJobs(1);
    }

    function resetFiltersHandler() {
        searchInput.value = '';
        statusFilter.value = '';
        companyFilter.value = '';
        filterJobs();
    }

    function viewJob(jobId) {
        const job = jobs.find(j => j._id === jobId);
        if (!job) return;
        const viewJobContent = document.getElementById('viewJobContent');
        viewJobContent.innerHTML = `
            <h5>${job.title}</h5>
            <p><strong>Company:</strong> ${job.company}</p>
            <p><strong>Job Type:</strong> ${capitalizeFirstLetter(job.jobType)}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Status:</strong> ${capitalizeFirstLetter(job.status)}</p>
            <p><strong>Deadline:</strong> ${formatDate(job.deadline)}</p>
            <p><strong>Salary:</strong> ${job.salary || 'Not specified'}</p>
            <p><strong>Eligibility:</strong> ${job.eligibility}</p>
            <p><strong>Description:</strong> ${job.description}</p>
            <p><strong>Departments:</strong> ${job.departments.join(', ') || 'All'}</p>
            <p><strong>Applicants:</strong> ${job.applicants.length}</p>
        `;
        const modal = new bootstrap.Modal(document.getElementById('viewJobModal'));
        modal.show();
        document.getElementById('approveJobBtn').onclick = () => updateJobStatus(jobId, 'approved', modal);
        document.getElementById('rejectJobBtn').onclick = () => updateJobStatus(jobId, 'rejected', modal);
    }

    async function updateJobStatus(id, status, modal) {
        try {
            await fetchAPI(`/jobs/${id}`, 'PATCH', { status });
            showToast(`Job ${status} successfully`, 'success');
            if (modal) modal.hide();
            fetchJobs();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    async function deleteJob(id) {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await fetchAPI(`/jobs/${id}`, 'DELETE');
            showToast('Job deleted successfully', 'success');
            fetchJobs();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    function editJob(jobId) {
        alert('Edit job functionality not implemented');
    }

    async function fetchJobs() {
        try {
            const data = await fetchAPI('/jobs');
            jobs = data.jobs;
            filteredJobs = [...jobs];
            populateCompanyFilter(jobs);
            filterJobs();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    if (addJobForm && saveJobBtn) {
        saveJobBtn.addEventListener('click', async () => {
            if (!validateForm(addJobForm)) return;
            const departments = ['cse', 'ise', 'ece', 'eee', 'mech', 'civil']
                .filter(id => addJobForm.querySelector(`#${id}`).checked);
            const body = {
                title: addJobForm.querySelector('#jobTitle').value,
                company: addJobForm.querySelector('#companyName').value,
                jobType: addJobForm.querySelector('#jobType').value,
                location: addJobForm.querySelector('#location').value,
                deadline: addJobForm.querySelector('#deadline').value,
                salary: addJobForm.querySelector('#salary').value || '',
                eligibility: addJobForm.querySelector('#eligibility').value,
                description: addJobForm.querySelector('#description').value,
                departments
            };
            try {
                await fetchAPI('/jobs', 'POST', body);
                showToast('Job added successfully', 'success');
                addJobForm.reset();
                addJobForm.classList.remove('was-validated');
                bootstrap.Modal.getInstance(document.getElementById('addJobModal')).hide();
                fetchJobs();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    if (searchInput && statusFilter && companyFilter && resetFilters) {
        searchInput.addEventListener('input', filterJobs);
        statusFilter.addEventListener('change', filterJobs);
        companyFilter.addEventListener('change', filterJobs);
        resetFilters.addEventListener('click', resetFiltersHandler);
    }

    document.addEventListener('click', e => {
        if (e.target.closest('.view-job-btn')) {
            viewJob(e.target.closest('.view-job-btn').dataset.jobId);
        } else if (e.target.closest('.edit-job-btn')) {
            editJob(e.target.closest('.edit-job-btn').dataset.jobId);
        } else if (e.target.closest('.approve-job-btn')) {
            updateJobStatus(e.target.closest('.approve-job-btn').dataset.jobId, 'approved');
        } else if (e.target.closest('.reject-job-btn')) {
            updateJobStatus(e.target.closest('.reject-job-btn').dataset.jobId, 'rejected');
        } else if (e.target.closest('.delete-job-btn')) {
            deleteJob(e.target.closest('.delete-job-btn').dataset.jobId);
        }
    });

    fetchJobs();
}

function initManageStudents() {
    const studentList = document.getElementById('studentList');
    if (!studentList) return;
    fetchAPI('/students').then(students => {
        studentList.innerHTML = students.map(student => `
            <div class="card">
                <p>Name: ${student.name}</p>
                <p>Email: ${student.email}</p>
                <p>Status: ${student.status}</p>
                <button onclick="updateUserStatus('${student._id}', 'approved')" class="btn btn-primary mr-2">Approve</button>
                <button onclick="updateUserStatus('${student._id}', 'rejected')" class="btn btn-outline">Reject</button>
            </div>
        `).join('');
    }).catch(err => showToast(err.message, 'error'));
}

function initManageRecruiters() {
    const recruiterList = document.getElementById('recruiterList');
    if (!recruiterList) return;
    fetchAPI('/recruiters').then(recruiters => {
        recruiterList.innerHTML = recruiters.map(recruiter => `
            <div class="card">
                <p>Company: ${recruiter.companyName}</p>
                <p>Email: ${recruiter.email}</p>
                <p>Status: ${recruiter.status}</p>
                <button onclick="updateUserStatus('${recruiter._id}', 'approved')" class="btn btn-primary mr-2">Approve</button>
                <button onclick="updateUserStatus('${recruiter._id}', 'rejected')" class="btn btn-outline">Reject</button>
            </div>
        `).join('');
    }).catch(err => showToast(err.message, 'error'));
}

async function updateUserStatus(id, status) {
    try {
        await fetchAPI(`/students/${id}`, 'PATCH', { status });
        showToast(`User ${status} successfully`, 'success');
        if (window.location.pathname.includes('manage-students')) initManageStudents();
        else initManageRecruiters();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function initEvents() {
    const eventList = document.getElementById('eventList');
    if (!eventList) return;
    fetchAPI('/events').then(events => {
        eventList.innerHTML = events.map(event => `
            <div class="card">
                <h4 class="font-poppins">${event.title}</h4>
                <p>Date: ${formatDate(event.date)}</p>
                <p>Time: ${event.time}</p>
                <p>Location: ${event.location}</p>
            </div>
        `).join('');
    }).catch(err => showToast(err.message, 'error'));
}

function initReports() {
    const reportList = document.getElementById('reportList');
    if (!reportList) return;
    fetchAPI('/reports').then(reports => {
        reportList.innerHTML = reports.map(report => `
            <div class="card">
                <p>Year: ${report.year}</p>
                <p>Students Placed: ${report.studentsPlaced}</p>
                <p>Average Package: ${report.averagePackage} LPA</p>
                <p>Top Recruiter: ${report.topRecruiter}</p>
            </div>
        `).join('');
    }).catch(err => showToast(err.message, 'error'));
}

document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    initRegister();
    initLogin();
    initStudentDashboard();
    initRecruiterDashboard();
    initPostJob();
    initManageJobs();
    initManageStudents();
    initManageRecruiters();
    initEvents();
    initReports();
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
});