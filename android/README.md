# TradeFlow Android App

This is a native Android WebView wrapper for the TradeFlow web application.

## Prerequisites

- Android Studio Arctic Fox or later
- JDK 17 or higher
- Android SDK API 34

## Setup

1. Open the `android` folder in Android Studio
2. Let Gradle sync the project
3. Configure the server URL in `MainActivity.java`:
   - For local testing: `http://10.0.2.2:5000` (Android emulator)
   - For production: `https://your-domain.com`

## Building

### Debug Build

```bash
./gradlew assembleDebug
```

The APK will be in `app/build/outputs/apk/debug/app-debug.apk`

### Release Build

```bash
./gradlew assembleRelease
```

The APK will be in `app/build/outputs/apk/release/app-release.apk`

## Installation

### Install on Emulator/Device

```bash
./gradlew installDebug
```

Or use Android Studio's "Run" button.

### Direct APK Install

Transfer the APK to your device and install it:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Configuration

### Change Server URL

Edit `app/src/main/java/com/tradeflow/app/MainActivity.java`:

```java
private static final String APP_URL = "https://your-tradeflow-server.com";
```

### App Icon

Place your app icon files in:
- `app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)

## Features

- Full web app functionality in native Android wrapper
- Offline support via PWA service worker
- Hardware back button navigation
- Full-screen immersive experience
- Local storage support
- JavaScript enabled

## Testing

### Local Development

1. Start the TradeFlow server on your computer
2. Update MainActivity.java to use `http://10.0.2.2:5000` (for emulator) or your computer's IP (for device)
3. Build and run the Android app

### Production

1. Deploy TradeFlow to your production server
2. Update MainActivity.java with your production URL
3. Build a release APK
4. Sign the APK with your keystore
5. Distribute via Google Play Store or direct download

## Publishing to Google Play Store

1. Create a keystore:
   ```bash
   keytool -genkey -v -keystore tradeflow.keystore -alias tradeflow -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Add signing config to `app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file("tradeflow.keystore")
               storePassword "your-password"
               keyAlias "tradeflow"
               keyPassword "your-password"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   ```

3. Build release APK:
   ```bash
   ./gradlew assembleRelease
   ```

4. Upload to Google Play Console

## Troubleshooting

### Gradle sync fails

Make sure you have JDK 17 installed and configured in Android Studio.

### App shows blank screen

Check that the APP_URL in MainActivity.java is correct and the server is running.

### Network errors

Ensure `INTERNET` permission is in AndroidManifest.xml (already included).

## License

MIT
