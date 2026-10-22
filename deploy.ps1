# Script Otomatis Deploy ke FastPanel (baranginaja.site)
Write-Host "🚀 Memulai proses deploy ke server FastPanel..." -ForegroundColor Cyan

# 1. Build project di laptop
Write-Host "📦 Mem-build Next.js di laptop..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build gagal, silakan periksa error di atas." -ForegroundColor Red
    exit 1
}

# 2. Kemas folder .next untuk production
Write-Host "🗜️  Mengompres hasil build..." -ForegroundColor Yellow
$src = '.\.next'
$temp = '.\temp_build\.next'
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
New-Item -ItemType Directory -Force -Path $temp | Out-Null
Copy-Item (Join-Path $src 'server') -Destination $temp -Recurse -Force
Copy-Item (Join-Path $src 'static') -Destination $temp -Recurse -Force
Get-ChildItem $src -File | Copy-Item -Destination $temp -Force
Compress-Archive -Path $temp -DestinationPath '.\build_next.zip' -Force
Remove-Item '.\temp_build' -Recurse -Force

# 3. Upload & Restart di Server
Write-Host "📤 Mengunggah hasil build dan memperbarui server..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no -i C:\Users\ACER\.ssh\id_ed25519 .\build_next.zip kakasi23@103.150.226.176:/var/www/kakasi23/data/www/baranginaja.site/
ssh -o StrictHostKeyChecking=no -i C:\Users\ACER\.ssh\id_ed25519 kakasi23@103.150.226.176 "cd /var/www/kakasi23/data/www/baranginaja.site && git pull && unzip -o build_next.zip && rm -f build_next.zip && chmod -R a+rX .next && npx pm2 restart baranginaja"

# 4. Hapus file zip sementara di laptop
Remove-Item '.\build_next.zip' -Force

Write-Host "✅ Selesai! Website https://baranginaja.site berhasil diperbarui!" -ForegroundColor Green
