// jestSetup.js
import { useContextSelector } from "use-context-selector";
import "@testing-library/jest-native/extend-expect";
import "react-native-reanimated/src/reanimated2/jestUtils";

require("react-native-reanimated").setUpTests();

jest.mock("use-context-selector", () => {
  const actualModule = jest.requireActual("use-context-selector");
  return {
    __esModule: true,
    ...actualModule,
    useContextSelector: jest.fn(),
  };
});

// 1) Mock AsyncStorage to avoid "NativeModule: AsyncStorage is null."
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// 2) Mock Reanimated to run useAnimatedReaction Synchronously:
//jest.mock("react-native-reanimated", () => {
//  const Reanimated = require("react-native-reanimated/mock");
//  return {
//    ...Reanimated,
//    // Override useAnimatedReaction so it runs immediately
//    useAnimatedReaction: (prepareFn, callbackFn) => {
//      callbackFn(prepareFn());
//    },
//    // You can also override other hooks if needed, e.g. useSharedValue
//    // useSharedValue: (init) => ({ value: init }),
//    // ...
//  };
//});
//
// or
//
//jest.mock("react-native-reanimated", () => {
//  // Use Reanimated's built-in mocked version
//  const Reanimated = require("react-native-reanimated/mock");
//
//  // Override the mock if needed
//  Reanimated.default.call = () => {};
//
//  return Reanimated;
//});

// 3) (Optional) mock the layout animations if they cause warnings
// Reanimated.addWhitelistedUIProps({ ... }); // only if needed

// 4) If you see any "useNativeDriver" warnings, you can do:
// jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// 5) Additional hush or custom log handling can go here

global.__reanimatedWorkletInit = () => {};
