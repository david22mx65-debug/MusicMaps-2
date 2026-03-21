# MusicMaps Android Deployment Guide

This project has been prepared for Android Studio using Capacitor.

## Prerequisites

1.  **Android Studio** installed on your machine.
2.  **Android SDK** configured.

## How to build the APK

1.  **Build the web project:**
    ```bash
    npm run build
    ```

2.  **Sync with Capacitor:**
    ```bash
    npm run cap:sync
    ```

3.  **Open in Android Studio:**
    ```bash
    npm run cap:open:android
    ```

4.  **In Android Studio:**
    -   Wait for Gradle to finish syncing.
    -   Select your device or emulator.
    -   Click the **Run** button (green play icon) or go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

## Permissions

The app requires the following permissions, which are already configured in the `AndroidManifest.xml` (via Capacitor):
-   `ACCESS_COARSE_LOCATION`
-   `ACCESS_FINE_LOCATION`

If you need background tracking, you may need to add `ACCESS_BACKGROUND_LOCATION` manually in `android/app/src/main/AndroidManifest.xml`.
