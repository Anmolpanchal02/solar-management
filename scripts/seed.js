const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@solar.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
    } else {
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@solar.com',
        password: hashedAdminPassword,
        phone: '1234567890',
        role: 'admin',
        isActive: true,
      });
      console.log('✅ Admin user created');
      console.log('   Email: admin@solar.com');
      console.log('   Password: admin123');
    }

    // Check if employee already exists
    const existingEmployee = await User.findOne({ email: 'employee@solar.com' });
    if (existingEmployee) {
      console.log('⚠️  Employee user already exists');
    } else {
      const hashedEmployeePassword = await bcrypt.hash('employee123', 10);
      await User.create({
        name: 'John Doe',
        email: 'employee@solar.com',
        password: hashedEmployeePassword,
        phone: '9876543210',
        role: 'employee',
        isActive: true,
      });
      console.log('✅ Employee user created');
      console.log('   Email: employee@solar.com');
      console.log('   Password: employee123');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nYou can now login with:');
    console.log('Admin: admin@solar.com / admin123');
    console.log('Employee: employee@solar.com / employee123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
