import mongoose from 'mongoose';

const connectDb = async()=>{
    try {
        const conn =  await mongoose.connect("mongodb://ziplofy2aws_db_user:UoErd1Bx9RWx5Bk0@cluster0.j17djyj.mongodb.net/test")
        console.log('Connected to database',conn.connection.host);
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

connectDb();