Write-Host "🚀 Starting AuraCare setup..."

# Backend setup
Write-Host "`n📦 Installing backend dependencies..."
Set-Location -Path "./backend"
npm install

# Frontend setup
Write-Host "`n📦 Installing frontend dependencies..."
Set-Location -Path "../frontend"
npm install

# Start both servers
Write-Host "`n🚀 Starting servers..."

# Start backend server in a new window
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$PWD/../backend'; npm run dev`"

# Start frontend server in a new window
Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$PWD'; npm run dev`"

Write-Host "`n✅ Setup complete! Servers are starting..."
Write-Host "📝 Backend running on: http://localhost:5000"
Write-Host "🌐 Frontend running on: http://localhost:5173"