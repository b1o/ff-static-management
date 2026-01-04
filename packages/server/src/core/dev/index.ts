import { Elysia } from "elysia";

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FF14 Static Hub - Auth Test</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      background: #1a1a2e;
      color: #eee;
    }
    h1 { color: #7c3aed; }
    h2 { color: #a78bfa; margin-top: 2rem; }
    button {
      background: #7c3aed;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      font-size: 1rem;
      margin: 0.5rem 0.5rem 0.5rem 0;
    }
    button:hover { background: #6d28d9; }
    button:disabled { background: #4a4a5a; cursor: not-allowed; }
    button.danger { background: #dc2626; }
    button.danger:hover { background: #b91c1c; }
    pre {
      background: #2a2a3e;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .status {
      padding: 1rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    .status.success { background: #065f46; }
    .status.error { background: #991b1b; }
    .status.info { background: #1e40af; }
    .card {
      background: #2a2a3e;
      padding: 1.5rem;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-info img {
      width: 64px;
      height: 64px;
      border-radius: 50%;
    }
    #log {
      max-height: 300px;
      overflow-y: auto;
    }
  </style>
</head>
<body>
  <h1>🎮 FF14 Static Hub - Auth Test</h1>
  
  <div id="auth-status" class="status info">Checking authentication status...</div>
  
  <div id="user-card" class="card" style="display: none;">
    <div class="user-info">
      <img id="user-avatar" src="" alt="Avatar">
      <div>
        <strong id="user-display-name"></strong>
        <div id="user-username" style="color: #888;"></div>
      </div>
    </div>
  </div>

  <h2>Auth Actions</h2>
  <button onclick="loginWithDiscord()">Login with Discord</button>
  <button onclick="checkMe()">Check /auth/me</button>
  <button onclick="logout()" class="danger">Logout</button>

  <h2>Test Protected Routes</h2>
  <button onclick="testRoute('GET', '/statics/my-statics')">GET /statics/my-statics</button>
  <button onclick="testRoute('POST', '/statics/create', { name: 'Test Static ' + Date.now()})">POST /statics/create</button>

  <h2>Response Log</h2>
  <pre id="log">Responses will appear here...</pre>

  <script>
    const API_BASE = '';
    
    function log(message, data) {
      const logEl = document.getElementById('log');
      const timestamp = new Date().toLocaleTimeString();
      let content = \`[\${timestamp}] \${message}\`;
      if (data !== undefined) {
        content += '\\n' + JSON.stringify(data, null, 2);
      }
      logEl.textContent = content + '\\n\\n' + logEl.textContent;
    }

    function updateAuthStatus(user) {
      const statusEl = document.getElementById('auth-status');
      const userCard = document.getElementById('user-card');
      
      if (user) {
        statusEl.className = 'status success';
        statusEl.textContent = '✅ Authenticated as ' + (user.displayName || user.username);
        
        userCard.style.display = 'block';
        document.getElementById('user-display-name').textContent = user.displayName || user.username;
        document.getElementById('user-username').textContent = '@' + user.username;
        
        if (user.avatar) {
          document.getElementById('user-avatar').src = 
            \`https://cdn.discordapp.com/avatars/\${user.discordId}/\${user.avatar}.png\`;
        } else {
          document.getElementById('user-avatar').src = 
            'https://cdn.discordapp.com/embed/avatars/0.png';
        }
      } else {
        statusEl.className = 'status error';
        statusEl.textContent = '❌ Not authenticated';
        userCard.style.display = 'none';
      }
    }

    async function checkMe() {
      log('GET /auth/me');
      try {
        const res = await fetch(API_BASE + '/auth/me', { credentials: 'include' });
        const data = await res.json();
        log('Response ' + res.status, data);
        
        if (res.ok && data.user) {
          updateAuthStatus(data.user);
        } else {
          updateAuthStatus(null);
        }
      } catch (err) {
        log('Error', err.message);
        updateAuthStatus(null);
      }
    }

    function loginWithDiscord() {
      log('Redirecting to Discord OAuth...');
      window.location.href = API_BASE + '/auth/discord';
    }

    async function logout() {
      log('POST /auth/logout');
      try {
        const res = await fetch(API_BASE + '/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        log('Response ' + res.status, data);
        updateAuthStatus(null);
      } catch (err) {
        log('Error', err.message);
      }
    }

    async function testRoute(method, path, body) {
      log(\`\${method} \${path}\`, body);
      try {
        const options = {
          method,
          credentials: 'include',
          headers: {}
        };
        if (body) {
          options.headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(body);
        }
        const res = await fetch(API_BASE + path, options);
        const data = await res.json();
        log('Response ' + res.status, data);
      } catch (err) {
        log('Error', err.message);
      }
    }

    // Check auth status on page load
    checkMe();
  </script>
</body>
</html>
`;

export const devRoutes = new Elysia({ prefix: "/dev" }).get("/test", ({ set }) => {
	console.log("Serving dev test HTML page");
	set.headers["content-type"] = "text/html";
	return html;
});
