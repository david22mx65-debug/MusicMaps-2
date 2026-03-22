# Guía para generar el APK de MusicMaps con Android Studio

Este proyecto utiliza **Capacitor** para convertir la aplicación web en una aplicación nativa de Android. Sigue estos pasos para generar tu APK:

## Requisitos previos
1. **Android Studio** instalado y configurado.
2. **Node.js** y **npm** instalados.

## Pasos para preparar el proyecto

1. **Instalar dependencias:**
   Asegúrate de que todas las dependencias estén instaladas:
   ```bash
   npm install
   ```

2. **Construir la aplicación web y sincronizar con Android:**
   Ejecuta el siguiente comando que compilará el proyecto web y actualizará la carpeta `android`:
   ```bash
   npm run build:android
   ```

## Pasos en Android Studio

1. **Abrir el proyecto:**
   Abre Android Studio y selecciona **"Open an existing project"**. Navega hasta la carpeta `android` de este repositorio y ábrela.

2. **Esperar a que Gradle sincronice:**
   Android Studio descargará las dependencias necesarias y sincronizará el proyecto. Esto puede tardar unos minutos la primera vez.

3. **Generar el APK:**
   - Ve al menú superior: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Una vez finalizado, aparecerá una notificación en la esquina inferior derecha. Haz clic en **"locate"** para encontrar el archivo `app-debug.apk`.

4. **Generar APK firmado (para producción):**
   - Ve a **Build > Generate Signed Bundle / APK...**
   - Selecciona **APK** y sigue las instrucciones para crear o usar un almacén de claves (keystore).

## Notas importantes
- **Permisos:** El archivo `AndroidManifest.xml` ya incluye los permisos necesarios para el GPS (`ACCESS_FINE_LOCATION`).
- **Iconos y Splash Screen:** Puedes cambiarlos en la carpeta `android/app/src/main/res`.
- **Depuración:** Puedes conectar tu teléfono Android por USB y darle a **"Run"** (el icono de play verde) en Android Studio para probar la app directamente.
