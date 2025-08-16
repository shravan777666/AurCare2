const axios = require('axios');

// Test basic server connectivity
async function testServer() {
  try {
    console.log('Testing server connectivity...');
    
    // Test if server is running
    const response = await axios.get('http://localhost:5000/api/auth/register-salon-owner', {
      method: 'POST',
      timeout: 5000
    });
    
    console.log('✅ Server is running!');
    console.log('Response:', response.data);
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start the server first.');
    } else if (error.response) {
      console.log('✅ Server is running!');
      console.log('Status:', error.response.status);
      console.log('Response:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Run test
testServer();

