import { lightStyles, darkStyles } from "../../styles/AppStyles";
import { useSettings } from "../../contexts/SettingsContext";
import { View, Text, ActivityIndicator } from "react-native";

const LoadingResponse = () => {
  const { isDarkMode } = useSettings();
  const styles = isDarkMode ? darkStyles : lightStyles;

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Generating text...</Text>
      <ActivityIndicator size="small" color="#0000ff" />
    </View>
  );
};

export default LoadingResponse;
