 // UI tab switching (keeps code local and simple)
    const tabLogin = document.getElementById('tabLogin');
    const tabSignup = document.getElementById('tabSignup');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const gotoSignup = document.getElementById('gotoSignup');
    const gotoLogin = document.getElementById('gotoLogin');

    function showLogin() {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
    }
    function showSignup() {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
    }

    tabLogin.addEventListener('click', showLogin);
    tabSignup.addEventListener('click', showSignup);
    gotoSignup.addEventListener('click', (e) => { e.preventDefault(); showSignup(); });
    gotoLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

    // form handling: attach handlers provided by auth.js
    document.getElementById('signupForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const password = document.getElementById('signupPassword').value;
      const out = registerUser({ name, email, password }); // from auth.js
      const msg = document.getElementById('signupMsg');
      if (!out.ok) { msg.textContent = out.message; return; }
      msg.style.color = 'green';
      msg.textContent = 'Account created — redirecting...';
      // small delay then redirect to dashboard
      setTimeout(() => window.location.href = 'dashboard/index.html', 800);
    });

    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;
      const out = loginUser({ email, password }); // from auth.js
      const msg = document.getElementById('loginMsg');
      if (!out.ok) { msg.textContent = out.message; return; }
      msg.style.color = 'green';
      msg.textContent = 'Login successful — redirecting...';
      setTimeout(() => window.location.href = 'dashboard/index.html', 500);
    });