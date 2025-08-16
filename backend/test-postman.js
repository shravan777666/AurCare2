const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test the registration endpoint
async function testRegistration() {
  try {
    console.log('🧪 Testing Salon Registration API...\n');
    
    // Create test files if they don't exist
    const logoPath = path.join(__dirname, 'test-logo.jpg');
    const licensePath = path.join(__dirname, 'test-license.pdf');
    
    // Create dummy files for testing
    if (!fs.existsSync(logoPath)) {
      console.log('📝 Creating test logo file...');
      fs.writeFileSync(logoPath, 'dummy logo content');
    }
    
    if (!fs.existsSync(licensePath)) {
      console.log('📝 Creating test license file...');
      fs.writeFileSync(licensePath, 'dummy license content');
    }
    
    // Create form data
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', 'Test Salon Owner');
    formData.append('email', `test${Date.now()}@salon.com`); // Unique email
    formData.append('password', 'password123');
    formData.append('salonName', 'Test Salon');
    formData.append('contactNumber', '1234567890');
    formData.append('description', 'A test salon for testing purposes');
    formData.append('address', JSON.stringify({
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345'
    }));
    
    // Add files
    formData.append('logo', fs.createReadStream(logoPath));
    formData.append('license', fs.createReadStream(licensePath));
    
    console.log('📤 Sending registration request...');
    
    const response = await axios.post('http://localhost:5000/api/auth/register-salon-owner', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ Registration successful!');
    console.log('📊 Response Status:', response.status);
    console.log('📄 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Registration failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Server is not running. Please start the server first:');
      console.error('   cd backend && node start-server.js');
    } else if (error.response) {
      console.error('📊 Response Status:', error.response.status);
      console.error('📄 Response Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('🔍 Error:', error.message);
    }
  }
}

// Test health endpoint first
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  const healthOk = await testHealth();
  if (!healthOk) {
    console.log('\n💡 Please start the server first:');
    console.log('   cd backend && node start-server.js');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  await testRegistration();
}

// Run if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testRegistration, testHealth };

