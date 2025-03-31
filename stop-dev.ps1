# Read the process ID from the file
$processId = Get-Content -Path ".next-dev-pid" -ErrorAction SilentlyContinue

if ($processId) {
    # Kill the process
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    
    # Remove the PID file
    Remove-Item -Path ".next-dev-pid" -Force -ErrorAction SilentlyContinue
    
    Write-Host "Development server stopped."
} else {
    Write-Host "No development server found running."
} 