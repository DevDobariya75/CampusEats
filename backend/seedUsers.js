import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Shop from './models/Shop.js';

dotenv.config();

const seedUsers = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('\n⚠️  Users already exist in database.');
      console.log('Delete existing users first if you want to reseed.');
      process.exit(0);
    }

    // Create Admin
    console.log('\nCreating Admin user...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@campuseats.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1234567890',
      isActive: true
    });
    console.log('✅ Admin created');

    // Create Shopkeeper and Shop
    console.log('\nCreating Shopkeeper user...');
    const shopkeeper = await User.create({
      name: 'John Shopkeeper',
      email: 'shopkeeper@campuseats.com',
      password: 'shop123',
      role: 'shop_owner',
      phone: '+1234567891',
      isActive: true
    });
    console.log('✅ Shopkeeper created');

    // Create Shop for the shopkeeper
    console.log('Creating Shop...');
    const shop = await Shop.create({
      name: 'Campus Cafe',
      description: 'Best coffee and snacks on campus',
      owner: shopkeeper._id,
      cuisine: ['Coffee', 'Snacks', 'Fast Food'],
      address: {
        street: '123 Campus Drive',
        city: 'University City',
        state: 'CA',
        zipCode: '12345',
        campus: 'Main Campus'
      },
      contact: {
        phone: '+1234567891',
        email: 'cafe@campuseats.com'
      },
      isActive: true,
      isOpen: true,
      rating: 4.5,
      deliveryTime: 20,
      deliveryFee: 2.99,
      minOrder: 5
    });
    console.log('✅ Shop created');

    // Create Delivery Partner
    console.log('\nCreating Delivery Partner user...');
    const delivery = await User.create({
      name: 'Mike Delivery',
      email: 'delivery@campuseats.com',
      password: 'delivery123',
      role: 'delivery_person',
      phone: '+1234567892',
      isActive: true
    });
    console.log('✅ Delivery Partner created');

    // Create Customer
    console.log('\nCreating Customer user...');
    const customer = await User.create({
      name: 'Sarah Customer',
      email: 'customer@campuseats.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1234567893',
      address: {
        street: '456 Student Housing',
        city: 'University City',
        state: 'CA',
        zipCode: '12345',
        campus: 'Main Campus'
      },
      isActive: true
    });
    console.log('✅ Customer created');

    console.log('\n===========================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('===========================================\n');
    console.log('LOGIN CREDENTIALS:\n');
    console.log('👑 ADMIN:');
    console.log('   Email: admin@campuseats.com');
    console.log('   Password: admin123\n');
    console.log('🏪 SHOPKEEPER:');
    console.log('   Email: shopkeeper@campuseats.com');
    console.log('   Password: shop123');
    console.log('   Shop: Campus Cafe\n');
    console.log('🚴 DELIVERY PARTNER:');
    console.log('   Email: delivery@campuseats.com');
    console.log('   Password: delivery123\n');
    console.log('🍽️ CUSTOMER:');
    console.log('   Email: customer@campuseats.com');
    console.log('   Password: customer123\n');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
