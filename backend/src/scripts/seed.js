require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB');

    
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      status: 'active',
    });

    const manager = await User.create({
      name: 'Jane Manager',
      email: 'manager@example.com',
      password: 'Manager@123',
      role: 'manager',
      status: 'active',
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    await User.create([
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'User@1234',
        role: 'user',
        status: 'active',
        createdBy: admin._id,
        updatedBy: admin._id,
      },
      {
        name: 'Bob Williams',
        email: 'bob@example.com',
        password: 'User@1234',
        role: 'user',
        status: 'active',
        createdBy: manager._id,
        updatedBy: manager._id,
      },
      {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: 'User@1234',
        role: 'user',
        status: 'inactive',
        createdBy: admin._id,
        updatedBy: admin._id,
      },
      {
        name: 'David Lee',
        email: 'david@example.com',
        password: 'User@1234',
        role: 'user',
        status: 'active',
        createdBy: manager._id,
        updatedBy: manager._id,
      },
    ]);

    console.log('\n Seed complete! Test accounts:');
    console.log('  Admin:   admin@example.com   / Admin@123');
    console.log('  Manager: manager@example.com / Manager@123');
    console.log('  Users:   alice@example.com   / User@1234');
    console.log('           bob@example.com     / User@1234');
    console.log('           carol@example.com   / User@1234 (inactive)');
    console.log('           david@example.com   / User@1234\n');

    process.exit(0);
  } catch (err) {
    console.error(' Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
