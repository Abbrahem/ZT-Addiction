const axios = require('axios');

async function testServer() {
  console.log('🧪 Testing server endpoints...\n');
  
  const baseURL = 'http://localhost:3002';
  
  // Test 1: Root endpoint
  try {
    console.log('1️⃣ Testing root endpoint...');
    const response = await axios.get(`${baseURL}/`);
    console.log('✅ Root:', response.data);
  } catch (error) {
    console.log('❌ Root failed:', error.message);
  }
  
  console.log('');
  
  // Test 2: Auth login endpoint
  try {
    console.log('2️⃣ Testing /api/auth/login endpoint...');
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'zt@gmail.com',
      password: 'zt123456'
    });
    console.log('✅ Login successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ Login failed with status:', error.response.status);
      console.log('   Response:', error.response.data);
    } else {
      console.log('❌ Login failed:', error.message);
    }
  }
  
  console.log('');
  
  // Test 3: Auth endpoint (without /login)
  try {
    console.log('3️⃣ Testing /api/auth endpoint...');
    const response = await axios.post(`${baseURL}/api/auth`, {
      email: 'zt@gmail.com',
      password: 'zt123456'
    });
    console.log('✅ Auth successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ Auth failed with status:', error.response.status);
      console.log('   Response:', error.response.data);
    } else {
      console.log('❌ Auth failed:', error.message);
    }
  }
  
  console.log('');
  
  // Test 4: Products endpoint
  try {
    console.log('4️⃣ Testing /api/products endpoint...');
    const response = await axios.get(`${baseURL}/api/products`);
    console.log('✅ Products:', response.data.length, 'products found');
  } catch (error) {
    if (error.response) {
      console.log('❌ Products failed with status:', error.response.status);
    } else {
      console.log('❌ Products failed:', error.message);
    }
  }
}

testServer();
