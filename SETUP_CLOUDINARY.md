# Setup Cloudinary - Media Library

## 1. Crear cuenta en Cloudinary (GRATIS)

1. Ve a: https://cloudinary.com/users/register_free
2. Crea tu cuenta (gratis hasta 25 GB)
3. Una vez dentro, ve al **Dashboard**

## 2. Obtener credenciales

En el Dashboard de Cloudinary verás:

```
Cloud name:     dxxxxx
API Key:        123456789012345
API Secret:     aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

## 3. Agregar variables de entorno

En tu archivo `.env.local` agrega:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dd4rp7toz
CLOUDINARY_API_KEY=855934749655115
CLOUDINARY_API_SECRET=z3wYtuCcHNi2TWZ1iCWh8wJ5BRs
```

**Ejemplo:**
```env
CLOUDINARY_CLOUD_NAME=dxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

## 4. Instalar dependencias

```bash
npm install cloudinary
```

## 5. Reiniciar el servidor

```bash
# Detén el servidor (Ctrl+C)
# Vuelve a iniciar
npm run dev
```

## ✅ Verificación

Una vez configurado, podrás:
- ✅ Subir imágenes desde la app
- ✅ Ver galería de imágenes por brand
- ✅ Usar las imágenes para publicar en Instagram
- ✅ URLs permanentes y públicas

## 📝 Notas

- **Plan gratuito**: 25 GB almacenamiento + 25 GB bandwidth/mes
- Las imágenes se organizan automáticamente por brand
- Las URLs son permanentes y no expiran
- Puedes acceder a las imágenes desde cualquier lugar

## 🔗 Enlaces útiles

- Dashboard: https://cloudinary.com/console
- Documentación: https://cloudinary.com/documentation
