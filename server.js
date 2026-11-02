const express = require('express');
const app = express();
const port = 3000;  // Or any port not used by your Spring Boot backend (e.g., 8080)

// Serve static files from 'public' folder
app.use(express.static('public'));  // <-- Changed from 'index' to 'public'

// Example API endpoint to proxy or handle requests (optional, for now)
app.get('/api/test', (req, res) => {
    res.json({ message: 'Hello from Node.js front-end!' });
});

// Add this before app.listen()
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
});

app.listen(port, () => {
    console.log(`Front-end server running at http://localhost:${port}`);
});