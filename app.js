// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const routes = require('./routes');
// const { connectToDatabase } = require('./config/database');

// require('dotenv').config();

// const app = express();

// app.use(helmet());
// app.use(cors());

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100
// });
// app.use(limiter);

// app.use(morgan('dev'));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use('/api', routes);

// app.get('/', (req, res) => {
//     res.json({
//         success: true,
//         message: 'Database is connected and server is running'
//     });
// });

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({
//         success: false,
//         message: 'Internal Server Error',
//         error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
// });

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//     try {
//         await connectToDatabase();
//         app.listen(PORT, () => {
//             console.log(`Server running on port ${PORT}`);
//         });
//     } catch (error) {
//         console.error('Failed to start server:', error);
//         process.exit(1);
//     }
// };

// startServer();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { connectToDatabase, closeDatabaseConnection } = require('./config/database');

require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Database is connected and server is running'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectToDatabase();
        const server = app.listen(PORT, () => {
            console.log(`Server running on port http://localhost:${PORT}`);
        });

        const gracefulShutdown = () => {
            console.log('Closing server gracefully...');
            server.close(async () => {
                await closeDatabaseConnection();
                console.log('Server closed and database connection closed.');
                process.exit(0);
            });
        };

        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
