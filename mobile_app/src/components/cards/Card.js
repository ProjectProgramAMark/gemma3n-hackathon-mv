import React, { useCallback, useRef } from "react";
import {
  Pressable,
  Text,
  Image,
  View,
  findNodeHandle,
  StyleSheet,
} from "react-native";
import { useContextSelector } from "use-context-selector";
import { CardContext } from "../../contexts/CardContext";
import { lightStyles, darkStyles } from "../../styles/AppStyles";
import { useSettings } from "../../contexts/SettingsContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import Colors from "../../styles/Colors";
import { usePredictions } from "../../contexts/PredictionContext";
import { LinearGradient } from "expo-linear-gradient";

const Card = React.memo(({ card, page, containerRef }) => {
  const { isDarkMode } = useSettings();
  const styles = isDarkMode ? darkStyles : lightStyles;

  /* prediction bar stuff */
  const { chooseCard, containerOffsetY } = usePredictions();

  /* selection helpers */
  const isSelectedCard = useContextSelector(
    CardContext,
    (ctx) => ctx.selectedCards[card.id]?.isSelected || false
  );
  const handleSelection = useContextSelector(
    CardContext,
    (c) => c.handleSelection
  );

  /* measure helper */
  const cardRef = useRef(null);

  /* ─────────── event handlers ─────────── */
  const playAudio = useCallback(() => {
    Speech.speak(card.cleanTitle);
  }, []);

  const toggleSelected = useCallback(() => {
    console.log(JSON.stringify(card, null, 2));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    /* ── trigger prediction bar ───────────────────────── */
    const becameSelected = handleSelection(card.id, card.cleanTitle); // boolean
    if (!becameSelected) return; // only predict on *select*, not deselect

    if (page === "PredictionBar") {
      chooseCard(card, null);
    } else {
      //cardRef.current?.measureInWindow((x, y, w, h) => {
      //  const relY = y - containerOffsetY;
      //  chooseCard(card, cardsDict, { x, y: relY, width: w, height: h });
      //});
      cardRef.current?.measureLayout(
        // align to parent container
        findNodeHandle(containerRef.current),
        (x, y, w, h) => chooseCard(card, { x, y, width: w, height: h }),
        console.warn
      );
    }
  }, [page, card, containerOffsetY]);

  const toggleFavorite = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const backgroundColor = Colors.popular;

  const shadowStyle = isSelectedCard
    ? {
        elevation: 0,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      }
    : {
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      };

  /* ─────────── render ─────────── */
  return (
    <View
      style={[
        {
          flex: 1,
          width: "100%",
          borderRadius: 20,
          backgroundColor: Colors.primary,
          ...shadowStyle, // elevation & shadow
        },
        page === "PredictionBar" && { flex: 0, width: "100%", height: "100%" },
      ]}
    >
      <LinearGradient
        colors={[backgroundColor, "#ffffff"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, width: "100%", borderRadius: 20, overflow: "hidden" }}
      >
        <Pressable
          ref={cardRef}
          style={[
            styles.card,
            isSelectedCard && styles.selectedCard,
            { backgroundColor: "transparent" },
          ]}
          onPress={() => {
            playAudio();
            toggleSelected();
          }}
          testID="card-pressable"
        >
          {/* default buttons */}
          <View style={[styles.cardIconsContainer]}>
            <AntDesign
              name={card.favorite ? "star" : "staro"}
              size={25}
              color="black"
              onPress={toggleFavorite}
              testID="favorite-pressable"
            />
            <AntDesign
              name="sound"
              size={25}
              color="black"
              onPress={playAudio}
            />
          </View>

          {/* card body */}
          <Image
            source={card.image}
            style={styles.cardImage}
            testID="card-image"
          />
          <Text style={styles.cardTitle} numberOfLines={2} ellipsizeMode="tail">
            {card.cleanTitle}
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
});

export default Card;
