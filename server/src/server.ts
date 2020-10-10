import 'dotenv/config'
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import todoRoutes from './routes/todo';

const app = express();

// DB
mongoose
    .connect(process.env.DATABASE!, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('DB connected'))
    .catch(err => console.log('DB CONNECTION ERROR: ', err));

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
// app.use(cors()); // allows all origins
if ((process.env.NODE_ENV = 'development')) {
    app.use(cors({ origin: `http://localhost:3000` }));
}
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', todoRoutes);

// Listen
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`API is running on port ${port}`);
});
