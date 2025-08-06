import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { SettingsProvider } from "../contexts/SettingsContext";
import { PredictionProvider } from "../contexts/PredictionContext";
import { CardContextProvider } from "../contexts/CardContext";
import { DataProvider } from "../contexts/DataContext";
import { useFonts } from "expo-font";
import { NativeModules, KeyboardAvoidingView, Platform } from "react-native";
import ResponseContainer from "../components/responseContainer/ResponseContainer";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// smoke test for LLM inference -- TODO: remove once initial testing finished
const { LlmInferenceModule } = NativeModules;
console.log("--- Checking for LlmInferenceModule ---");
console.log(LlmInferenceModule);
import { LogBox } from "react-native";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack } from "expo-router";

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

LogBox.ignoreLogs([
  "App Start Span could not be finished.", //from if statement below
  //"Sending `onAnimatedValueUpdate` with no listeners registered.",
]);

const DrawerLayout = () => {
  const [loaded, error] = useFonts({
    mon: require("../../assets/fonts/Montserrat-Regular.ttf"),
    "mon-i": require("../../assets/fonts/Montserrat-Italic.ttf"),
    "mon-t": require("../../assets/fonts/Montserrat-Thin.ttf"),
    "mon-sb": require("../../assets/fonts/Montserrat-SemiBold.ttf"),
    "mon-b": require("../../assets/fonts/Montserrat-Bold.ttf"),
    ...Ionicons.font,
    ...AntDesign.font,
    ...MaterialCommunityIcons.font,
    ...MaterialIcons.font,
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error("Error loading fonts:", error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      console.log("Fonts loaded successfully");
    }
  }, [loaded]);

  //console.log("----------  Drawer Layout ----------");
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
          <SettingsProvider>
            <DataProvider>
              <CardContextProvider>
                <PredictionProvider>
                  {loaded ? (
                    <>
                      <Stack>
                        <Stack.Screen
                          name="index"
                          options={{
                            headerTitle: "Mosaic Voice Demo",
                            headerTitleAlign: "center",
                            headerStyle: {
                              backgroundColor: "#fff", // or your theme color
                            },
                            headerTitleStyle: {
                              fontWeight: "bold",
                              fontSize: 18,
                            },
                          }}
                        />
                      </Stack>
                      <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "position" : "height"}
                        style={{
                          flex: 1,
                          position: "absolute",
                          width: "100%",
                          bottom: 0,
                        }}
                      >
                        <ResponseContainer />
                      </KeyboardAvoidingView>
                    </>
                  ) : null}
                </PredictionProvider>
              </CardContextProvider>
            </DataProvider>
          </SettingsProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default DrawerLayout;
