import { View, Text, TouchableOpacity } from "react-native";
import { useContextSelector } from "use-context-selector";
import { CardContext } from "../../contexts/CardContext";
import * as Haptics from "expo-haptics";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { lightStyles, darkStyles } from "../../styles/AppStyles";
import { useSettings } from "../../contexts/SettingsContext";
import Colors from "../../styles/Colors";
//import { BlurView } from 'expo-blur';
import { ScrollView } from "react-native-gesture-handler";
//using this ^ ScrollView instead of react-native ScrollView is a workaround for
//current android bug where ScrollView does not scroll in absolute positioned components

const SelectedCardsList = ({ handleSend, clearSelected }) => {
  const { isDarkMode } = useSettings();
  const styles = isDarkMode ? darkStyles : lightStyles;

  const selectedCards = useContextSelector(
    CardContext,
    (context) => context.selectedCards
  );

  const handleSelection = useContextSelector(
    CardContext,
    (context) => context.handleSelection
  );

  return (
    <View style={styles.selectedCardsListContainer}>
      <Ionicons
        name="trash-bin"
        size={50}
        color={Colors.red}
        style={{ marginLeft: 10 }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          clearSelected();
        }}
      />
      <ScrollView
        style={styles.selectedCardsScrollView}
        horizontal={false}
        nestedScrollEnabled={true}
        pointerEvents="auto"
        contentContainerStyle={styles.selectedCardsScrollViewContentContainer}
      >
        {Object.entries(selectedCards).map(
          ([key, value]) =>
            value.isSelected && (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  handleSelection(key, value.cleanTitle);
                }}
                style={styles.selectedCardsItem}
              >
                <Text style={styles.selectedCardsItemText}>
                  {value.cleanTitle}
                </Text>
              </TouchableOpacity>
            )
        )}
      </ScrollView>
      <Icon
        name="arrow-right"
        size={50}
        color={Colors.primary}
        style={{
          padding: 10,
          textShadowColor: Colors.white,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 5,
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          handleSend();
        }}
      />
    </View>
  );
};

export default SelectedCardsList;
