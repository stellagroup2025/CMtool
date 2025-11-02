# Solución: "The image format is not supported" con PNG

## El Problema

Instagram no puede acceder o no acepta la imagen PNG que estás subiendo. Esto puede ser por varias razones:

## ✅ Soluciones

### Opción 1: Usar una URL pública existente (Recomendado para pruebas)

En lugar de subir un archivo local, usa una imagen PNG pública de Internet para probar:

**URLs de prueba que funcionan:**
```
https://picsum.photos/1080/1080.jpg
https://i.imgur.com/example.png
```

### Opción 2: Verificar que ngrok esté correctamente configurado

1. **Asegúrate de que ngrok esté corriendo:**
   ```bash
   ngrok http 3000
   ```

2. **Verifica que la URL generada sea accesible:**
   - Copia la URL que generó el upload (algo como `https://xxx.ngrok-free.dev/uploads/instagram/...`)
   - Ábrela en tu navegador
   - Deberías ver la imagen
   - Si ves un error de ngrok, necesitas:
     - Agregar `--domain` a tu comando ngrok
     - O deshabilitar el warning de ngrok

### Opción 3: Configurar headers para ngrok

Si estás usando ngrok, Instagram podría estar siendo bloqueado por la pantalla de advertencia de ngrok.

**En `.env.local` agrega:**
```
NEXT_PUBLIC_BASE_URL=https://tu-dominio.ngrok-free.dev
```

### Opción 4: Convertir PNG a JPEG (Instagram prefiere JPEG)

Modifica el archivo de upload para convertir automáticamente PNG a JPEG:

```bash
npm install sharp
```

Luego actualiza `/app/api/upload/route.ts` para procesar la imagen.

### Opción 5: Usar un servicio de hosting de imágenes

**Servicios gratuitos:**
- **Cloudinary** - Gratis hasta 25GB
- **Imgur** - Gratis ilimitado
- **ImgBB** - Gratis ilimitado

Sube tu imagen a uno de estos servicios y usa la URL directa.

## 🔍 Verificar qué está pasando

1. **Ve a los logs del servidor** y busca:
   ```
   Publishing single image
   imageUrl: "..."
   ```

2. **Copia esa URL y pégala en el navegador** - ¿Puedes ver la imagen?

3. **Si no puedes ver la imagen en el navegador**, Instagram tampoco podrá

## ⚠️ Requisitos de Instagram para imágenes

- Formato: JPEG preferido (PNG soportado pero puede dar problemas)
- Dimensiones mínimas: 320px de ancho
- Aspect ratio: Entre 4:5 y 1.91:1
- Tamaño máximo: 8MB
- Debe ser accesible públicamente vía HTTPS

## 🎯 Prueba Rápida

1. Ve a la página de publicación
2. En lugar de subir un archivo, **pega esta URL en el campo "Image URL"**:
   ```
   https://picsum.photos/1080/1080.jpg
   ```
3. Click en "Publish Image"
4. Si funciona → el problema es con tu servidor/ngrok
5. Si no funciona → el problema es con los tokens/permisos

## 📝 Siguiente Paso Recomendado

Para desarrollo local, te recomiendo usar **Cloudinary** o **Imgur** para las imágenes:

1. Modifica el endpoint de upload para subir a Cloudinary
2. Devuelve la URL pública de Cloudinary
3. Instagram podrá acceder sin problemas

¿Quieres que te ayude a implementar alguna de estas soluciones?
