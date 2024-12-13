document.addEventListener('DOMContentLoaded', () => {
    initializeDarkMode();
    displayCountdownWidget();
});

function displayCountdownWidget() {
    const countdownWidget = document.getElementById('countdownWidget');
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];

    if (reminders.length === 0) {
        countdownWidget.textContent = 'No upcoming birthdays';
        return;
    }

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds

    let minDaysDifference = Infinity;

    reminders.forEach(reminder => {
        const birthday = new Date(reminder.birthday);
        const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
        let daysDifference;

        if (thisYearBirthday >= now) {
            daysDifference = Math.ceil((thisYearBirthday - now) / oneDay);
        } else {
            const nextYearBirthday = new Date(now.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
            daysDifference = Math.ceil((nextYearBirthday - now) / oneDay);
        }

        if (daysDifference < minDaysDifference) {
            minDaysDifference = daysDifference;
        }
    });

    countdownWidget.innerHTML = `
        <div class="countdown-title">Next Birthday in:</div>
        <div>${minDaysDifference} days</div>
    `;

    // Update the countdown every day
    setTimeout(displayCountdownWidget, oneDay);
}

document.getElementById('addReminderBtn').addEventListener('click', () => {
    document.getElementById('homePage').classList.add('d-none');
    document.getElementById('addReminderPage').classList.remove('d-none');
    animatePageTransition('addReminderPage');
});

document.getElementById('viewRemindersBtn').addEventListener('click', () => {
    document.getElementById('homePage').classList.add('d-none');
    document.getElementById('viewRemindersPage').classList.remove('d-none');
    loadReminders();
    animatePageTransition('viewRemindersPage');
});

document.getElementById('monthlySummaryBtn').addEventListener('click', () => {
    document.getElementById('homePage').classList.add('d-none');
    document.getElementById('monthlySummaryPage').classList.remove('d-none');
    loadMonthlySummary();
    animatePageTransition('monthlySummaryPage');
});

document.getElementById('backToHomeFromAdd').addEventListener('click', () => {
    document.getElementById('addReminderPage').classList.add('d-none');
    document.getElementById('homePage').classList.remove('d-none');
    animatePageTransition('homePage');
});

document.getElementById('backToHomeFromView').addEventListener('click', () => {
    document.getElementById('viewRemindersPage').classList.add('d-none');
    document.getElementById('homePage').classList.remove('d-none');
    animatePageTransition('homePage');
});

document.getElementById('backToHomeFromSummary').addEventListener('click', () => {
    document.getElementById('monthlySummaryPage').classList.add('d-none');
    document.getElementById('homePage').classList.remove('d-none');
    animatePageTransition('homePage');
});

document.getElementById('reminderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const birthday = document.getElementById('birthday').value;
    saveReminder(name, birthday);
    document.getElementById('reminderForm').reset();
    showFeedback('Reminder saved successfully!', 'success', 'feedbackMessageAdd');
});

function saveReminder(name, birthday) {
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.push({ name, birthday });
    localStorage.setItem('reminders', JSON.stringify(reminders));
    loadReminders(); // To ensure the updated reminders list is loaded
    loadMonthlySummary(); // To ensure the monthly summary page is updated
    displayCountdownWidget(); // To ensure the countdown widget is updated
}

function loadReminders() {
    const remindersTable = document.getElementById('remindersTable');
    remindersTable.innerHTML = '';
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.sort((a, b) => a.name.localeCompare(b.name)); // Sorting names alphabetically

    reminders.forEach((reminder, index) => {
        const birthday = new Date(reminder.birthday);
        const isUpcoming = isBirthdayUpcoming(birthday);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${isUpcoming ? '<i class="fas fa-birthday-cake text-danger animated flash infinite"></i> ' : ''}${reminder.name.toUpperCase()}</td>
            <td>${formatDate(birthday)}</td>
            <td>${calculateAge(birthday)}</td>
            <td>
                <button class="btn btn-danger btn-sm ml-2" onclick="deleteReminder(${index})" data-toggle="tooltip" title="Delete"><i class="fas fa-trash-alt"></i> Delete</button>
            </td>
        `;
        remindersTable.appendChild(row);
    });

    $('[data-toggle="tooltip"]').tooltip();
    setupPagination(reminders);
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).substr(-2);
    return `${day}/${month}/${year}`;
}

function calculateAge(birthday) {
    const ageDiff = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function isBirthdayUpcoming(birthday) {
    const today = new Date();
    const upcomingLimit = new Date();
    upcomingLimit.setDate(today.getDate() + 7); // 7 days from today

    const birthdayThisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());

    return today <= birthdayThisYear && birthdayThisYear <= upcomingLimit;
}

function deleteReminder(index) {
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.splice(index, 1);
    localStorage.setItem('reminders', JSON.stringify(reminders));
    showFeedback('Reminder deleted successfully!', 'danger', 'feedbackMessageView');
    loadReminders();
    loadMonthlySummary(); // To ensure the monthly summary page is updated
    displayCountdownWidget(); // To ensure the countdown widget is updated
}

function showFeedback(message, type, elementId) {
    const feedbackMessage = document.getElementById(elementId);
    feedbackMessage.className = `alert alert-${type} fade-in`;
    feedbackMessage.textContent = message;
    feedbackMessage.classList.remove('d-none');
    setTimeout(() => {
        feedbackMessage.classList.add('d-none');
    }, 3000);
}

function loadMonthlySummary() {
    const monthlySummaryContainer = document.getElementById('monthlySummaryContainer');
    monthlySummaryContainer.innerHTML = '';
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    const months = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
    ];
    const monthlySummary = {};

    reminders.forEach(reminder => {
        const month = new Date(reminder.birthday).getMonth();
        if (!monthlySummary[month]) {
            monthlySummary[month] = [];
        }
        monthlySummary[month].push(reminder);
    });

    months.forEach((month, index) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'monthly-summary fade-in';
        const color = index % 2 === 0 ? 'table-primary' : 'table-secondary';
        const table = document.createElement('table');
        table.className = `table ${color}`;
        table.innerHTML = `
            <thead>
                <tr>
                    <th>${month}</th>
                    <th>BIRTHDAY</th>
                    <th>AGE</th>
                </tr>
            </thead>
            <tbody>
        `;
        if (monthlySummary[index]) {
            monthlySummary[index]
                .sort((a, b) => new Date(a.birthday).getDate() - new Date(b.birthday).getDate())
                .forEach(reminder => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${reminder.name.toUpperCase()}</td>
                        <td>${formatDate(new Date(reminder.birthday))}</td>
                        <td>${calculateAge(new Date(reminder.birthday))}</td>
                    `;
                    table.appendChild(row);
                });
        } else {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3">No reminders</td>';
            table.appendChild(row);
        }
        table.innerHTML += '</tbody>';
        monthDiv.appendChild(table);
        monthlySummaryContainer.appendChild(monthDiv);
    });
}

function setupPagination(reminders) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const totalPages = Math.ceil(reminders.length / 10);
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item fade-in';
        li.innerHTML = `<a class="page-link" href="#" onclick="goToPage(${i})">${i}</a>`;
        pagination.appendChild(li);
    }
    goToPage(1);
}

function goToPage(pageNumber) {
    const remindersTable = document.getElementById('remindersTable');
    remindersTable.innerHTML = '';
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    reminders.sort((a, b) => a.name.localeCompare(b.name)); // Sorting names alphabetically
    const startIndex = (pageNumber - 1) * 10;
    const endIndex = startIndex + 10;
    reminders.slice(startIndex, endIndex).forEach((reminder, index) => {
        const row = document.createElement('tr');
        const isUpcoming = isBirthdayUpcoming(new Date(reminder.birthday));
        row.innerHTML = `
            <td>${isUpcoming ? '<i class="fas fa-birthday-cake text-danger animated flash infinite"></i> ' : ''}${reminder.name.toUpperCase()}</td>
            <td>${formatDate(new Date(reminder.birthday))}</td>
            <td>${calculateAge(new Date(reminder.birthday))}</td>
            <td>
                <button class="btn btn-danger btn-sm ml-2" onclick="deleteReminder(${index + startIndex})" data-toggle="tooltip" title="Delete"><i class="fas fa-trash-alt"></i> Delete</button>
            </td>
        `;
        remindersTable.appendChild(row);
    });
    $('[data-toggle="tooltip"]').tooltip();
}

// Initialize tooltips
$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

// Implementing search functionality
document.getElementById('searchReminderInput').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toUpperCase();
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    const filteredReminders = reminders.filter(reminder => reminder.name.toUpperCase().includes(searchTerm));
    displayReminders(filteredReminders);
});

function displayReminders(reminders) {
    const remindersTable = document.getElementById('remindersTable');
    remindersTable.innerHTML = '';
    reminders.forEach((reminder, index) => {
        const row = document.createElement('tr');
        const isUpcoming = isBirthdayUpcoming(new Date(reminder.birthday));
        row.innerHTML = `
            <td>${isUpcoming ? '<i class="fas fa-birthday-cake text-danger animated flash infinite"></i> ' : ''}${reminder.name.toUpperCase()}</td>
            <td>${formatDate(new Date(reminder.birthday))}</td>
            <td>${calculateAge(new Date(reminder.birthday))}</td>
            <td>
                <button class="btn btn-danger btn-sm ml-2" onclick="deleteReminder(${index})" data-toggle="tooltip" title="Delete"><i class="fas fa-trash-alt"></i> Delete</button>
            </td>
        `;
        remindersTable.appendChild(row);
    });
    $('[data-toggle="tooltip"]').tooltip();
}

// Implementing dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    document.getElementById('darkModeToggle').textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
});

function initializeDarkMode() {
    const isDarkMode = JSON.parse(localStorage.getItem('darkMode'));
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('darkModeToggle').textContent = 'Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('darkModeToggle').textContent = 'Dark Mode';
    }
}

document.addEventListener('DOMContentLoaded', initializeDarkMode);

// Implementing export to CSV
document.getElementById('exportCsvBtn').addEventListener('click', exportToCsv);

function exportToCsv() {
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    const csvContent = "data:text/csv;charset=utf-8,"
        + reminders.map(reminder => `${reminder.name.toUpperCase()},${formatDate(new Date(reminder.birthday))},${calculateAge(new Date(reminder.birthday))}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'reminders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function animatePageTransition(pageId) {
    const page = document.getElementById(pageId);
    page.classList.add('fade-in');
    setTimeout(() => {
        page.classList.remove('fade-in');
    }, 2000);
}
