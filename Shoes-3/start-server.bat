@echo off
cd /d "%~dp0"
echo Serving Shoes-3 at http://localhost:3000
echo   Homepage:  http://localhost:3000/index.html
echo   Shop:      http://localhost:3000/shop.html
echo   Product:   http://localhost:3000/product.html
echo.
python -m http.server 3000
