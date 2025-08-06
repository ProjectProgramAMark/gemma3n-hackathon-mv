import React, { useCallback, useEffect, useState, useRef } from "react";
import { View, Animated, StyleSheet, Platform } from "react-native";
import { useContextSelector } from "use-context-selector";
import { CardContext } from "../../contexts/CardContext";
import { lightStyles, darkStyles } from "../../styles/AppStyles";
import { useSettings } from "../../contexts/SettingsContext";
import LoadingResponse from "./LoadingResponse";
import GeneratedResponse from "./GeneratedResponse";
import SelectedCardsList from "./SelectedCardsList";
import * as Haptics from "expo-haptics";
import { BlurView } from "@react-native-community/blur";
//import { BlurView } from "expo-blur";
//import PredictedCardsBar from "./PredictedCardsBar";
import { generateSentenceLocal } from "../../utils/sentenceGenerator";

const ResponseContainer = React.memo(() => {
  const { isDarkMode } = useSettings();
  const styles = isDarkMode ? darkStyles : lightStyles;

  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [playButtonVisible, setPlayButtonVisible] = useState(false);
  const [generatedText, setGeneratedText] = useState(null);

  const selectedCards = useContextSelector(
    CardContext,
    (context) => context.selectedCards
  );
  const clearSelected = useContextSelector(
    CardContext,
    (context) => context.clearSelected
  );

  const isCardSelected = Object.values(selectedCards).some(
    (item) => item.isSelected
  );

  const slideAnim = useRef(new Animated.Value(100)).current;

  const [selectedCardsArray, setSelectedCardsArray] = useState([]);

  //if selectedCards changes, reset the ui
  useEffect(() => {
    setGeneratedText(false);
  }, [selectedCards]);

  useEffect(() => {
    if (isCardSelected) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isCardSelected]);

  const stableSetGeneratedText = useCallback((newValue) => {
    setGeneratedText(newValue);
  }, []);

  const handleSend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isSelectedCardsArray = Object.keys(selectedCards).filter(
      (key) => selectedCards[key].isSelected
    );
    const selectedCardsArrayCleanTitles = isSelectedCardsArray.map(
      (key) => selectedCards[key].cleanTitle
    );

    // debugging
    // console.log("selectedCards: ", selectedCards);
    console.log("isSelectedCardsArray: ", isSelectedCardsArray);
    console.log(
      "selectedCardsArrayCleanTitles: ",
      selectedCardsArrayCleanTitles
    );

    setSelectedCardsArray(selectedCardsArrayCleanTitles);

    sendSelectedCards(selectedCardsArrayCleanTitles); // server
    //sendSelectedCards(selectedCardsArrayCleanTitles); // server
  };

  //TODO: move to dataContext
  const sendSelectedCards = async (selectedCardsArrayCleanTitles) => {
    // console.log("--- entering sendSelectedCards ---");
    console.log(selectedCardsArrayCleanTitles);
    try {
      setIsGeneratingText(true);

      const cleanedText = await generateSentenceLocal(
        selectedCardsArrayCleanTitles
      );
      setGeneratedText(cleanedText);
      setPlayButtonVisible(true);

      //debugging
      //const testResponse = "This is a test response";
      //setGeneratedText(testResponse);
      //setPlayButtonVisible(true);
      //handleHistory(historyArray, testResponse);
    } catch (error) {
      console.error("Error generating text:", error);
    } finally {
      setIsGeneratingText(false);
    }
  };

  return (
    <Animated.View
      style={[
        { transform: [{ translateY: slideAnim }] },
        { paddingBottom: 10 },
      ]}
    >
      {/*<BlurView
        intensity={50}
        tint={"extraLight"}
        style={[
          styles.responseContainer,
          Platform.OS === "ios" && { backgroundColor: Colors.white },
        ]}
        {...(Platform.OS === "android" && {
          experimentalBlurMethod: "dimezisBlurView",
        })}
      >*/}
      {Platform.OS === "android" ? (
        /* simple translucent overlay for android – no blur */
        /* dimezisBlurView causing stacked pages to get completely blocked */
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(250,250,250,0.90)" },
          ]}
        />
      ) : (
        /* iOS blur behaves fine */
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurType="xlight"
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
          overlayColor="#00000000"
        />
      )}

      {isCardSelected && !generatedText && !isGeneratingText && (
        <View style={styles.responseContainerSelectedCards}>
          {/*<PredictedCardsBar />*/}
          <SelectedCardsList
            handleSend={handleSend}
            clearSelected={clearSelected}
          />
        </View>
      )}

      {!generatedText && isGeneratingText && <LoadingResponse />}

      {generatedText && !isGeneratingText && (
        <GeneratedResponse
          llmGeneratedText={generatedText}
          setGeneratedText={setGeneratedText}
          setLlmGeneratedText={stableSetGeneratedText}
          selectedCards={selectedCardsArray}
          clearSelected={clearSelected}
        />
      )}
      {/*</BlurView>*/}
    </Animated.View>
  );
});

export default ResponseContainer;
