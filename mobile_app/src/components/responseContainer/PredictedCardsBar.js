import React from "react";
import { ScrollView, View } from "react-native";
import { lightStyles, darkStyles } from "../../styles/AppStyles";
import { useSettings } from "../../contexts/SettingsContext";
import { useContextSelector } from "use-context-selector";
import { PredictionContext } from "../../contexts/PredictionContext";
import Card from "../cards/Card";

const targetCardHeight = 100; //TODO: calculate based on screen width / height

const PredictedCardsBar = React.memo(() => {
  const { isDarkMode } = useSettings();
  const styles = isDarkMode ? darkStyles : lightStyles;

  const { predictions, isPredictionVisible, hidePredictedCards } =
    useContextSelector(PredictionContext, (context) => ({
      predictions: context.predictions,
      isPredictionVisible: context.isPredictionVisible,
      hidePredictedCards: context.hidePredictedCards,
    }));

  const onCardSelect = (card) => {
    console.log("Selected card:", card);
  };

  if (!isPredictionVisible) return null; // Don't render if not visible

  return (
    <View style={styles.predictedCardsBar}>
      <ScrollView
        style={[styles.predictedCardsContainer, { height: targetCardHeight }]}
        contentContainerStyle={{ flexGrow: 1 }}
        horizontal={true} // Set to true for horizontal scrolling, false for vertical
      >
        {predictions.map((card, index) => (
          <Card card={card} page={"PredictedCardsBar"} key={index} />
        ))}
      </ScrollView>
    </View>
  );
});

export default PredictedCardsBar;
