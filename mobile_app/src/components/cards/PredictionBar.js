import React, { useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSettings } from "../../contexts/SettingsContext";
import { lightStyles, darkStyles } from "../../styles/AppStyles";
import Card from "./Card";
import Colors from "../../styles/Colors";
import { AntDesign } from "@expo/vector-icons";
import { usePredictions } from "../../contexts/PredictionContext";

export default function PredictionBar({ visible, data, anchor, onClose }) {
  if (!visible || !anchor) return null;

  const { isDarkMode } = useSettings();
  const stylesDefault = isDarkMode ? darkStyles : lightStyles;

  const { itemMetrics } = usePredictions();

  const w = (itemMetrics.width || anchor.width) * 0.8;
  const h = (itemMetrics.height || anchor.height) * 0.8;
  const spacing = itemMetrics.spacing || 8;

  //const contentWidth = w * 5 + spacing * 4; //itemMetrics.width * 5 + itemMetrics.spacing * 4 || anchor.width * 5;
  const screenWidth = Dimensions.get("window").width;

  // container = from pressed-card X to right edge
  const containerWidth = Math.max(1, screenWidth - anchor.x);

  const renderItem = useCallback(
    ({ item, index }) => (
      <View
        style={[
          {
            width: w,
            height: h,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 5,
          },
          stylesDefault.cardItemContainer,
        ]}
      >
        <Card card={item} page="PredictionBar" index={index} />
      </View>
    ),
    [stylesDefault, w, h, spacing]
  );

  return (
    <View
      style={[
        styles.container,
        {
          top: anchor.y - h,
          left: anchor.x,
          height: h,
          width: containerWidth, // exactly overlay the card
        },
      ]}
    >
      <FlatList
        horizontal
        data={data}
        style={{ flex: 1 }}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <AntDesign name="closecircle" size={24} color={Colors.black} />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 20,
    elevation: 30,
  },
  closeBtn: { position: "absolute", left: -20, top: -5 },
});
