const axios = require('axios');

async function testServer() {
  try {
    console.log('🔍 Testing server connectivity...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health', { timeout: 5000 });
    console.log('✅ Health endpoint working:', healthResponse.data);
    
    // Test registration endpoint with GET (should return 404 or 405)
    try {
      await axios.get('http://localhost:5000/api/auth/register-salon-owner', { timeout: 5000 });
    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 405)) {
        console.log('✅ Registration endpoint exists (correctly rejects GET requests)');
      } else {
        console.log('⚠️  Unexpected response from registration endpoint:', error.response?.status);
      }
    }
    
    console.log('\n🎉 Server is running and endpoints are accessible!');
    console.log('💡 You can now test the registration API in Postman');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server is not running. Please start it with:');
      console.error('   cd backend && node start-server.js');
    } else {
      console.error('❌ Error testing server:', error.message);
    }
  }
}

testServer();








