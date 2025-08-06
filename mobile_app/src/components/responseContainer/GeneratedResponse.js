import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { lightStyles, darkStyles } from "../../styles/AppStyles";
import { useSettings } from "../../contexts/SettingsContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import Colors from "../../styles/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-root-toast";
import { regenerateSentenceLocal } from "../../utils/sentenceGenerator";
import * as Speech from "expo-speech";

const GeneratedResponse = React.memo(
  ({
    llmGeneratedText,
    setGeneratedText,
    setLlmGeneratedText,
    selectedCards,
    clearSelected,
  }) => {
    const { isDarkMode } = useSettings();
    const styles = isDarkMode ? darkStyles : lightStyles;

    const [textHeight, setTextHeight] = useState(0);

    const [thumbsDownPressed, setThumbsDownPressed] = useState(false);
    const [isSendingAlternativeResponse, setIsSendingAlternativeResponse] =
      useState(false);
    const [userEditText, setUserEditText] = useState("");
    const [isRegeneratingText, setIsRegeneratingText] = useState(false);
    const [isEdited, setIsEdited] = useState(false);
    const [doneEditing, setDoneEditing] = useState(false);

    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    useEffect(() => {
      setUserEditText(llmGeneratedText);
    }, [llmGeneratedText]);

    const handleContentSizeChange = (event) => {
      //setTextHeight(event.nativeEvent.contentSize.height);
      setTextHeight(
        Math.max(40, Math.min(100, event.nativeEvent.contentSize.height))
      );
    };

    const playAudio = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      try {
        setIsLoadingAudio(true);
        Speech.speak(isEdited ? userEditText : llmGeneratedText);
      } catch (error) {
        console.error("Error playing audio:", error);
      } finally {
        setIsLoadingAudio(false);
      }
    };

    const handleThumbsUp = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      saveUserFeedback("good", null);
      setLlmGeneratedText(null);

      Toast.show("Thanks for your feedback!", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    };

    const handleThumbsDown = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setThumbsDownPressed(true);
    };

    const handleRegenerate = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      regenerateText();
    };

    const handleUserEditTextChange = (newText) => {
      setUserEditText(newText);
      if (!isEdited) {
        setIsEdited(true);
      } else {
        if (newText === llmGeneratedText) {
          setIsEdited(false);
        }
      }
    };

    const handleInputFocus = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      //setIsEdited(false);
    };

    const regenerateText = async () => {
      saveUserFeedback("bad", llmGeneratedText);
      try {
        setIsRegeneratingText(true);
        /* ---------- 1. on‑device first ---------- */
        // let regenerated = await regenerateSentenceLocal(
        //   selectedCards,
        //   llmGeneratedText
        // );

        // /* ---------- 2. cloud fallback ---------- */
        // if (!regenerated) {
        //   regenerated = await regenerateTextServer(
        //     selectedCards,
        //     llmGeneratedText,
        //     deviceId
        //   );
        // }

        //on-device
        const regenerated = await regenerateSentenceLocal(
          selectedCards,
          llmGeneratedText
        );
        setLlmGeneratedText(regenerated);
      } catch (error) {
        console.error("Error regenerating llm response: ", error);
      } finally {
        setIsRegeneratingText(false);
      }
    };

    const sendNewEdit = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      saveUserFeedback("bad", userEditText);
      try {
        setIsSendingAlternativeResponse(true);
        setDoneEditing(true);

        // update llmgeneratedtext to the user's submitted edit.
        // this will, in turn, update useredittext via the useeffect hook.
        setLlmGeneratedText(userEditText);
      } catch (error) {
        console.error("error updating ui after sending feedback:", error);
        setIsEdited(false);
        setDoneEditing(false);
      } finally {
        setIsSendingAlternativeResponse(false);
        //setGeneratedText(null);
        Toast.show("Thanks for your feedback!", {
          duration: Toast.durations.SHORT,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        });
      }
    };

    const saveUserFeedback = async (userRating, alternativeResponse) => {
      try {
        console.log("Saving user feedback:", {
          userRating,
          alternativeResponse,
        });
      } catch (error) {
        console.log("error saving user feedback: ", error);
      }
    };

    return (
      <View style={styles.generatedResponseContainer}>
        <TouchableOpacity
          onPress={() => {
            setGeneratedText(null);
            clearSelected();
          }}
          style={{
            //backgroundColor: '#fff',
            borderColor: "grey",
            borderRadius: 20,
            borderWidth: 1,
            padding: 2,
            //marginLeft: 15,
            alignSelf: "flex-start",
            margin: 5,
            position: "absolute",
            top: 0,
            zIndex: 2,
          }}
        >
          <Ionicons name="close-outline" size={20} color={Colors.grey} />
        </TouchableOpacity>
        {thumbsDownPressed ? (
          <View style={styles.userEditContainer}>
            {!doneEditing && (
              <View style={styles.userEditQuestion}>
                <Text style={styles.userEditQuestionText}>
                  What did you mean?
                </Text>
              </View>
            )}
            <View
              style={[
                styles.userInputContainer,
                doneEditing && { paddingTop: 20 },
              ]}
            >
              <View style={styles.userEditTextInputContainer}>
                <TextInput
                  multiline
                  value={userEditText}
                  onChangeText={handleUserEditTextChange}
                  onContentSizeChange={handleContentSizeChange}
                  style={[
                    styles.userEditTextInput,
                    { minHeight: 40, maxHeight: 100, height: textHeight },
                  ]}
                  onFocus={handleInputFocus}
                  //on
                  editable={!doneEditing && !isSendingAlternativeResponse}
                  autoFocus={!doneEditing}
                />
              </View>
              <AntDesign
                style={styles.regeneratedTextButton}
                name="sound"
                size={50}
                color={Colors.black}
                onPress={playAudio}
              />
              {!doneEditing && isEdited && (
                <FontAwesome
                  style={[
                    styles.regeneratedTextButton,
                    {
                      textShadowColor: Colors.white,
                      textShadowOffset: { width: 0, height: 0 },
                      textShadowRadius: 5,
                    },
                  ]}
                  name="arrow-right"
                  size={50}
                  color={Colors.primary}
                  onPress={sendNewEdit}
                />
              )}
            </View>
          </View>
        ) : (
          <View style={styles.feedbackContainer}>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingQuestion}>
                <Text style={styles.ratingQuestionText}>
                  Is this a good response?
                </Text>
              </View>
              <FontAwesome
                style={[
                  styles.regenerateButton,
                  {
                    textShadowColor: Colors.white,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 5,
                  },
                ]}
                name="refresh"
                size={50}
                color={Colors.primary}
                onPress={handleRegenerate}
              />
              <FontAwesome
                style={styles.thumbsUp}
                name="thumbs-up"
                size={50}
                color={Colors.green}
                onPress={handleThumbsUp}
              />
              <FontAwesome
                style={styles.thumbsDown}
                name="thumbs-down"
                size={50}
                color={Colors.red}
                onPress={handleThumbsDown}
              />
            </View>
            <View style={styles.generatedTextContainer}>
              <View style={styles.llmGeneratedTextContainer}>
                <ScrollView
                  style={[styles.userEditTextInput, { maxHeight: 100 }]}
                >
                  <Text style={styles.llmGeneratedText}>
                    {llmGeneratedText}
                  </Text>
                </ScrollView>
              </View>
              <AntDesign
                style={styles.audioIcon}
                name="sound"
                size={50}
                color={Colors.black}
                onPress={playAudio}
              />
            </View>
          </View>
        )}
        {isSendingAlternativeResponse && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Sending updated text...</Text>
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        )}
        {isRegeneratingText && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Regenerating text...</Text>
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        )}
      </View>
    );
  }
);

export default GeneratedResponse;
