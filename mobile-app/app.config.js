export default {
  "expo": {
    "owner": "imamura-mmj", // ← ここに追加します
    "name": "hitsuji-mobile",
    "slug": "hitsuji-mobile",
    "version": "1.0.0",
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "experiments": {
      "tsconfigPaths": true
    },
    "plugins": [],
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/hitsuji-logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.safetysheepsmile.dev",
    },
    "android": {
      "package": "com.safety_sheep_smile.dev",
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "backgroundColor": "#FFFFFF",
      "navigationBar": {
        "backgroundColor": "#FFFFFF"
      }
    },
    "extra": {
      "buildDate": new Date().toISOString(), // ビルド時の日時をISO形式で設定
      "apiBaseUrl": "https://hitsuji.dev.mmj.vn/",
      "eas": {
        "projectId": "58a5c060-261d-43c9-8b3e-3dae3ae2a09d"
      }
    }
  },
}