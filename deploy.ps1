# Script Otomatis Deploy ke FastPanel (baranginaja.site)
Write-Host "[1/3] Mengemas hasil build..." -ForegroundColor Yellow
$src = "D:\Capstone\baranginaja\baranginaja\.next"
$temp = "D:\Capstone\baranginaja\baranginaja\temp_build\.next"
if (Test-Path "D:\Capstone\baranginaja\baranginaja\temp_build") { 
    Remove-Item "D:\Capstone\baranginaja\baranginaja\temp_build" -Recurse -Force 
}
New-Item -ItemType Directory -Force -Path $temp | Out-Null
Copy-Item (Join-Path $src 'server') -Destination $temp -Recurse -Force
Copy-Item (Join-Path $src 'static') -Destination $temp -Recurse -Force
Get-ChildItem $src -File | Copy-Item -Destination $temp -Force
Compress-Archive -Path $temp -DestinationPath "D:\Capstone\baranginaja\baranginaja\build_next.zip" -Force
Remove-Item "D:\Capstone\baranginaja\baranginaja\temp_build" -Recurse -Force

Write-Host "[2/3] Mengunggah hasil build ke server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -i C:\Users\ACER\.ssh\id_ed25519 D:\Capstone\baranginaja\baranginaja\build_next.zip kakasi23@103.150.226.176:/var/www/kakasi23/data/www/baranginaja.site/

Write-Host "[3/3] Memperbarui dan restart PM2 di server..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -i C:\Users\ACER\.ssh\id_ed25519 kakasi23@103.150.226.176 'cd /var/www/kakasi23/data/www/baranginaja.site ; git pull ; unzip -o build_next.zip ; rm -f build_next.zip ; chmod -R a+rX .next ; npx pm2 restart baranginaja'

if (Test-Path "D:\Capstone\baranginaja\baranginaja\build_next.zip") {
    Remove-Item "D:\Capstone\baranginaja\baranginaja\build_next.zip" -Force
}

Write-Host "SUKSES: Website https://baranginaja.site berhasil diperbarui!" -ForegroundColor Green
