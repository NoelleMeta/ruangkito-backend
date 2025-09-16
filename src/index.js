// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Import semua rute
const authRoutes = require('./routes/authRoutes');
const ruanganRoutes = require('./routes/ruanganRoutes');
const peminjamanRoutes = require('./routes/peminjamanRoutes'); // <-- TAMBAHKAN
const persetujuanRoutes = require('./routes/persetujuanRoutes'); // <-- TAMBAHKAN
const adminRoutes = require('./routes/adminRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Peminjaman Ruangan API Documentation"
}));

// Routes
app.get('/', (req, res) => {
    res.send('API Server Peminjaman Ruangan is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api', ruanganRoutes);
app.use('/api', peminjamanRoutes); // <-- TAMBAHKAN
app.use('/api', persetujuanRoutes); // <-- TAMBAHKAN
app.use('/api', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});