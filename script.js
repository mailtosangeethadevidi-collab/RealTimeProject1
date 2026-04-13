// --- Navigation Logic (Internal View Switching) ---
let partnerEmail = ""; // To track who you are chatting with
function showPage(pageId) {
    document.querySelectorAll('.view').forEach(page => {
        page.classList.add('hidden');
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        // If it's the welcome page, ensure flex layout is preserved
        if(pageId === 'welcome-page') targetPage.classList.add('welcome-container');
    }
}
// Map showView to showPage for compatibility
function showView(id) { showPage(id); }
const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const password = document.getElementById('regPass').value.trim(); // Changed 'pass' to 'password'

        if (!email.includes('@')) {
            return alert("Please enter a valid college email address.");
        }

        // Always work with the 'users' array
        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(u => u.email === email)) {
            alert("An account with this email already exists.");
            showPage('login-page');
            return;
        }

        const userData = { name, email, password };
        users.push(userData);
        
        // Save to the central 'users' list
        localStorage.setItem('users', JSON.stringify(users));
        
        alert("Account created successfully! Please login.");
        regForm.reset();
        showPage('login-page');
    });
}
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Get input values
        const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
        const passInput = document.getElementById('loginPass').value;

        // 2. Pull the central 'users' database
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // 3. Find user in the central array
        // FIX: We check '.password' instead of '.pass' to match the Reset function
        const userMatch = users.find(u => u.email.toLowerCase() === emailInput && u.password === passInput);

        if (userMatch) {
            // 4. Create the session object
            const userSession = {
                name: userMatch.name,
                email: userMatch.email,
                profilePic: userMatch.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            };

            // 5. Save session and redirect
            localStorage.setItem('loggedInUser', JSON.stringify(userSession));
            window.location.href = 'dashboard.html';
        } else {
            // If the email exists but password is wrong OR if user doesn't exist
            alert("Invalid email or password.");
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
        window.location.href = 'index.html'; 
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
    const modal = document.getElementById('askModal');
    if (modal) {
        modal.style.display = 'flex'; // Shows the rectangle
    }
}

function closeAskModal() {
    const modal = document.getElementById('askModal');
    if (modal) {
        modal.style.display = 'none'; // Hides the rectangle
    }
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
    const email = document.getElementById('reset-email').value.trim().toLowerCase();
    const newPass = document.getElementById('reset-new-password').value.trim();

    if (!email || !newPass) return alert("Please fill all fields.");

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex !== -1) {
        users[userIndex].password = newPass;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.removeItem('loggedInUser'); // Clear old session
        alert("Password updated! Try logging in now.");
        showPage('login-page');
    } else {
        alert("Email not found in our records.");
    }
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
// --- 1. Your existing function to show the count ---
function updateDashboardMessages() {
    const me = JSON.parse(localStorage.getItem('loggedInUser'));
    const db = JSON.parse(localStorage.getItem('messagesDB')) || [];
    const display = document.getElementById('unread-count-display');

    if (!me || !display) return;

    const unreadMessages = db.filter(m => m.receiver === me.email && m.read === false);
    
    if (unreadMessages.length > 0) {
        const latest = unreadMessages[unreadMessages.length - 1];
        display.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="background: #e53e3e; color: white; padding: 2px 8px; border-radius: 10px; font-weight: bold; font-size: 0.8rem;">
                    ${unreadMessages.length} New
                </span>
                <span>Latest: "${latest.text.substring(0, 20)}..."</span>
            </div>`;
    } else {
        display.innerHTML = `<span style="color: #a0aec0;">No new messages. You're all caught up!</span>`;
    }
}

// --- 2. NEW: Function to open the chat from the card ---
function openDashboardChat() {
    const me = JSON.parse(localStorage.getItem('loggedInUser'));
    const db = JSON.parse(localStorage.getItem('messagesDB')) || [];
    
    const myMessages = db.filter(m => m.receiver === me.email);

    if (myMessages.length > 0) {
        const latestMsg = myMessages[myMessages.length - 1];
        const senderEmail = latestMsg.sender;
        
        // Fetch sender's name for the header
        const senderData = JSON.parse(localStorage.getItem(senderEmail));
        const senderName = senderData ? senderData.name : "Student";

        // Open the modal (Ensure openChat() is defined on this page)
        openChat(senderEmail, senderName);
        
        // Mark as read so the badge updates
        db.forEach(m => {
            if(m.sender === senderEmail && m.receiver === me.email) m.read = true;
        });
        localStorage.setItem('messagesDB', JSON.stringify(db));
        updateDashboardMessages(); 
    } else {
        alert("No messages to display!");
    }
}

document.addEventListener('DOMContentLoaded', updateDashboardMessages);


function openChat(email, name) {
    partnerEmail = email;
    const modal = document.getElementById('chatModal');
    if (modal) {
        document.getElementById('chatTitle').innerText = "Chat with " + name;
        modal.style.display = 'flex';
        renderMessages();
    }
}

function closeChat() {
    document.getElementById('chatModal').style.display = 'none';
}

function renderMessages() {
    const me = JSON.parse(localStorage.getItem('loggedInUser')).email;
    const db = JSON.parse(localStorage.getItem('messagesDB')) || [];
    const chatBox = document.getElementById('chatBox');
    
    const filtered = db.filter(m => 
        (m.sender === me && m.receiver === partnerEmail) || 
        (m.sender === partnerEmail && m.receiver === me)
    );

    chatBox.innerHTML = filtered.map(m => {
        const isMe = m.sender === me;
        return `
            <div style="align-self: ${isMe ? 'flex-end' : 'flex-start'}; max-width: 85%;">
                <div style="background:${isMe ? '#4a90e2' : 'white'}; 
                            color:${isMe ? 'white' : '#333'}; 
                            padding:12px 16px; border-radius:18px; 
                            box-shadow: 0 2px 5px rgba(0,0,0,0.05); font-size:0.95rem;">
                    ${m.text}
                </div>
            </div>`;
    }).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
}
function sendMessage() {
    const input = document.getElementById('chatInput');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!input.value.trim() || !loggedInUser || !partnerEmail) return;

    let db = JSON.parse(localStorage.getItem('messagesDB')) || [];
    
    const newMsg = {
        sender: loggedInUser.email,
        receiver: partnerEmail,
        text: input.value.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false 
    };

    db.push(newMsg);
    localStorage.setItem('messagesDB', JSON.stringify(db));
    
    input.value = ""; // Clear input
    renderMessages(); // Refresh the UI
}
