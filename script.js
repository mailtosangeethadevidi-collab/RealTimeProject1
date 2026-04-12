// --- Navigation Logic (Internal View Switching) ---
function showPage(pageId) {
    document.querySelectorAll('.view').forEach(page => {
        page.classList.add('hidden');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }}
const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPass').value;
        if (!email.includes('@')) {
            alert("Please enter a valid college email address.");
            return;}
        if (localStorage.getItem(email)) {
            alert("An account with this email already exists. Please login.");
            showPage('login-page');
            return;}
        const userData = { name, email, pass };
        localStorage.setItem(email, JSON.stringify(userData));
        alert("Account created successfully! Please login.");
        regForm.reset();
        showPage('login-page');
    });
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value;
        const storedData = localStorage.getItem(email);
        if (storedData) {
            const user = JSON.parse(storedData);
            if (user.pass === pass) {
                let users = JSON.parse(localStorage.getItem('users')) || [];
                const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
                const userEntry = {
                    name: user.name,
                    email: email,
                    profilePic: user.profilePic || user.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                };

                if (userIndex !== -1) {
                    // Update existing entry to ensure the photo is the latest one
                    users[userIndex] = userEntry;
                } else {
                    // Add as a new entry if they aren't in the global list yet
                    users.push(userEntry);
                }
                
                localStorage.setItem('users', JSON.stringify(users));

                // 2. Save the session for the current logged-in user
                // We save the 'userEntry' version to ensure session data matches the phonebook
                localStorage.setItem('loggedInUser', JSON.stringify(userEntry));
                
                // 3. Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert("Incorrect password.");
            }
        } else {
            alert("Email not found. Please create an account first.");
        }
    });
}

// --- Dynamic Dashboard Loader ---
// This runs whenever ANY page (like dashboard.html) loads
function initDashboard() {
    const activeUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (activeUser) {
        // Update the Navbar name
        const navName = document.getElementById('nav-user-display');
        if (navName) navName.innerText = activeUser.name;

        // Update the large "Welcome back" greeting
        const greeting = document.getElementById('dash-user-greeting');
        if (greeting) greeting.innerText = activeUser.name;
        // 3. NEW: Update Profile Icon in Nav
       if (activeUser && activeUser.profilePic) {
        const navAvatar = document.querySelector('.user-avatar-small');
        if (navAvatar) {
            navAvatar.innerHTML = `<img src="${activeUser.profilePic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
    }
    }
}

// --- Logout Function ---
function handleLogout() {
    // Show a quick confirmation
    if (confirm("Are you sure you want to log out?")) {
        // 1. Clear the logged-in user from storage
        localStorage.removeItem('loggedInUser');
        
        // 2. Redirect to the login or index page
        window.location.href = 'login.html'; 
    }
}

function joinEvent(eventName) {
    alert(`Success! You have been registered for: ${eventName}`);
}
// Function to update the Dashboard stats on load
function updateDashboardStats() {
    const userObj = JSON.parse(localStorage.getItem('loggedInUser'));
    const forumDB = JSON.parse(localStorage.getItem('forumDB')) || [];
    
    if (userObj) {
        // Set Greeting
        document.getElementById('dash-user-greeting').innerText = userObj.name;
        document.getElementById('nav-user-display').innerText = userObj.name;

        // Filter questions asked by this specific student using their email
        const myQuestions = forumDB.filter(q => q.email === userObj.email);
        
        // Update the count on the dashboard card
        const countDisplay = document.getElementById('q-count-display');
        if (countDisplay) {
            countDisplay.innerText = myQuestions.length;
        }
    }
}

// Navigate to Forum and automatically open the "Ask" form
function navigateToForumAsk() {
    // We set a flag in localStorage so forum.html knows to open the "Ask" section
    localStorage.setItem('openForumAction', 'ask');
    window.location.href = 'forum.html';
}

// Navigate to Forum and show only the user's questions

// Run stats update when dashboard loads
window.onload = updateDashboardStats;
// Initialize the name display every time the window loads
window.onload = initDashboard;
function updateQuestionCount() {
    // 1. Get the current logged-in user's details
    const userObj = JSON.parse(localStorage.getItem('loggedInUser'));
    
    // 2. Get the global forum database
    const forumDB = JSON.parse(localStorage.getItem('forumDB')) || [];

    if (userObj && userObj.email) {
        // 3. Filter the questions to find only those asked by YOU
        const myQuestions = forumDB.filter(q => q.email === userObj.email);

        // 4. Update the number on the dashboard card
        const countDisplay = document.getElementById('q-count-display');
        if (countDisplay) {
            countDisplay.innerText = myQuestions.length;
        }
    }
}

// Ensure this runs every time the Dashboard page is loaded
window.onload = updateQuestionCount;
document.addEventListener('DOMContentLoaded', () => {
    const userObj = JSON.parse(localStorage.getItem('loggedInUser'));
    const forumDB = JSON.parse(localStorage.getItem('forumDB')) || [];

    if (userObj) {
        // Update Gretting
        document.getElementById('dash-user-greeting').innerText = userObj.name;
        document.getElementById('nav-user-display').innerText = userObj.name;

        // Update Question Count based on user email
        const myQuestionsCount = forumDB.filter(q => q.email === userObj.email).length;
        document.getElementById('q-count-display').innerText = myQuestionsCount;
    }
});
// Open and Close Modal Functions
function openAskModal() {
    document.getElementById('askModal').style.display = 'flex';
}

function closeAskModal() {
    document.getElementById('askModal').style.display = 'none';
}

// Direct Submission Logic
function submitDirectQuestion() {
    const userObj = JSON.parse(localStorage.getItem('loggedInUser'));
    const title = document.getElementById('modalTitle').value;
    const body = document.getElementById('modalBody').value;
    const tagsRaw = document.getElementById('modalTags').value;

    if(!title || !tagsRaw) return alert("Please fill Title and Tags");

    const newQ = {
        id: Date.now(),
        title: title,
        body: body,
        tags: tagsRaw.split(',').map(t => t.trim()),
        votes: 0,
        votedBy: [],
        likedBy: [],
        answers: [],
        author: userObj.name,
        email: userObj.email, // Capturing identity for tracking
        time: new Date().toLocaleString()
    };

    // Save to the same Database used by forum.html
    let db = JSON.parse(localStorage.getItem('forumDB')) || [];
    db.unshift(newQ);
    localStorage.setItem('forumDB', JSON.stringify(db));

    alert("Question posted successfully to the Forum!");
    closeAskModal();
    
    // Refresh the dashboard count immediately
    if (typeof updateDashboardStats === 'function') updateDashboardStats();
}
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user) {
        // Update Name
        const dashName = document.querySelector('.welcome-section h1');
        if (dashName) dashName.textContent = `Welcome back, ${user.name}!`;

        // Update Profile Icon in Nav (if you have an img tag there)
        const navAvatar = document.querySelector('.user-avatar-small');
        if (navAvatar && user.profilePic) {
            navAvatar.innerHTML = `<img src="${user.profilePic}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }
    }
});
// Function to switch between views
function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    // Show the requested view
    document.getElementById(viewId).classList.remove('hidden');
}

// Logic to handle the password change
function handlePasswordReset() {
    const emailInput = document.getElementById('reset-email').value.trim().toLowerCase();
    const newPassword = document.getElementById('reset-new-password').value.trim();

    if (!emailInput || !newPassword) return alert("Fill all fields");

    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if the email exists at all
    const exists = users.some(u => u.email.toLowerCase() === emailInput);
    if (!exists) return alert("Email not found!");

    // NEW LOGIC: Update ALL entries with this email (to clear duplicates)
    users = users.map(user => {
        if (user.email.toLowerCase() === emailInput) {
            return { ...user, password: newPassword };
        }
        return user;
    });

    // Save the cleaned-up database
    localStorage.setItem('users', JSON.stringify(users));
    
    // Clear the current session
    localStorage.removeItem('loggedInUser');

    alert("Password updated for all instances of this account!");
    showView('login-page');
}
function handleLogin() {
    const emailInput = document.getElementById('login-email').value.trim().toLowerCase();
    const passInput = document.getElementById('login-password').value.trim();

    // Pull the database we just updated
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Find a match where BOTH email and password are correct
    const validUser = users.find(u => 
        u.email.toLowerCase() === emailInput && u.password === passInput
    );

    if (validUser) {
        localStorage.setItem('loggedInUser', JSON.stringify(validUser));
        window.location.href = "dashboard.html";
    } else {
        // If they use the old password, this will trigger!
        alert("Access Denied: Incorrect password or email.");
    }
}