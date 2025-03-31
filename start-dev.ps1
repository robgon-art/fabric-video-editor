# Start the Next.js development server in the background
$nextProcess = Start-Process npm -ArgumentList "run", "dev" -WindowStyle Hidden -PassThru

# Store the process ID for cleanup
$nextProcess.Id | Out-File -FilePath ".next-dev-pid" -Encoding UTF8

# Wait a moment for the server to start
Start-Sleep -Seconds 3

# Open the browser
Start-Process "http://localhost:3000" 