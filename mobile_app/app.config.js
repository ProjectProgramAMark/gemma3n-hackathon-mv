import 'dotenv/config';

const VARIANT = process.env.APP_VARIANT ?? 'development';

require('dotenv').config({
  path:
    VARIANT === 'production' || VARIANT === 'preview'
      ? './.env.production'
      : './.env.development',
});

const isProd  = VARIANT === 'production' || VARIANT === 'preview';

const appName   = isProd ? 'Mosaic Voice' : 'Mosaic Voice (Dev)';
const appScheme = isProd ? 'mosaicvoicescheme' : 'mosaicvoicescheme-dev';

// debugging
console.log("VARIANT:", VARIANT);
console.log("isProd:", isProd);
console.log("appName:", appName);
console.log("appScheme:", appScheme);

// Now, export a function that receives the default config
export default ({ config }) => {

  const androidAuthIntentFilter = {
    action: "VIEW",
    data: { scheme: appScheme, host: "auth", pathPrefix: "/" },
    category: ["BROWSABLE", "DEFAULT"]
  };

  // Construct the final configuration object using determined values
  return {
    // Start with Expo's internal defaults
    ...config,
    // --- Define YOUR app's specific configuration ---
    name: appName, // Use determined name
    slug: "mosaic-voice",
    version: "1.0.09", // Consider reading from package.json
    orientation: "default",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    scheme: appScheme, // Use determined scheme
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      ...config.ios, // Spread Expo's iOS defaults
      name: appName, // Use determined name
      scheme: appScheme, // Use determined scheme
      supportsTablet: true,
      bundleIdentifier: "com.mosaic-voice.mobile-app", // Base bundle ID (could also be conditional if needed)
      buildNumber: "2", // you can change this to your desired ios build number
      infoPlist: {
        UIBackgroundModes: ["audio"]
      }
    },
    android: {
      ...config.android, // Spread Expo's Android defaults
      name: appName, // Use determined name
      scheme: appScheme, // Use determined scheme
      package: "com.projectprogramamark.mosaic_voice",
      versionCode: 6,
      adaptiveIcon: { // Explicitly define adaptiveIcon
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      // Combine base filters (if any) with the environment-specific one
      intentFilters: [
        // Add any common/base filters here if needed
        androidAuthIntentFilter // Add the determined auth filter
      ]
    },
    web: {
      ...config.web, // Spread Expo's web defaults
      favicon: "./assets/favicon.png"
    },
    plugins: [ // Define base plugins
      "expo-router",
      "expo-secure-store",
      [
        "@sentry/react-native/expo",
        {
          organization: "mosaic-voice",
          project: "mosaic-voice",
          url: "https://sentry.io/"
        }
      ]
    ],
    extra: { // Define 'extra' config
      ...config.extra, // Spread Expo's default extra config
      router: {
        origin: false
      },
      eas: {
        projectId: "e574c1a0-c00c-4e26-859b-73d81815f1b1"
      }
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    updates: {
      url: "https://u.expo.dev/41e4dfc4-d25b-4786-bd9b-342326f67625"
    },
    owner: "mosaic_voice"
  };
};
