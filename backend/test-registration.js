const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test registration endpoint
async function testRegistration() {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', 'Test Salon Owner');
    formData.append('email', 'test@salon.com');
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

    // Create test files if they don't exist
    const logoPath = path.join(__dirname, 'test-logo.png');
    const licensePath = path.join(__dirname, 'test-license.pdf');
    
    // Create dummy files for testing
    if (!fs.existsSync(logoPath)) {
      fs.writeFileSync(logoPath, 'dummy logo content');
    }
    if (!fs.existsSync(licensePath)) {
      fs.writeFileSync(licensePath, 'dummy license content');
    }

    // Add files
    formData.append('logo', fs.createReadStream(logoPath));
    formData.append('license', fs.createReadStream(licensePath));

    console.log('Testing registration endpoint...');
    
    const response = await axios.post('http://localhost:5000/api/auth/register-salon-owner', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });

    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testRegistration();
}

module.exports = testRegistration;

