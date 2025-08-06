import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import CardList from "../components/cards/CardList";
import { useDataContextSelector } from "../contexts/DataContext";
import popularTitles from "../../assets/data/popular_cards";
import Colors from "../styles/Colors";
import { askLLM, runSmokeTest } from "../utils/llm";

const HomePage = () => {
  const loading = useDataContextSelector((context) => context.loading);
  const homeId = useDataContextSelector((context) => context.homeCategory);
  const cards = useDataContextSelector((context) => context.cards);
  const categories = useDataContextSelector((context) => context.categories);

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");

  async function onSend() {
    setReply("⏳ generating…");
    try {
      const r = await askLLM(prompt || "Hello, LLM!");
      setReply(r);
    } catch (e) {
      setReply("❌ " + e.message);
    }
  }

  // optional: run the Swift smoke test once on mount
  React.useEffect(() => {
    runSmokeTest();
  }, []);

  // Memoize homeCards and titledList
  const homeCards = useMemo(() => {
    if (!categories || !cards) return [];
    if (Object.keys(categories).length > 0 && Object.keys(cards).length > 0) {
      if (categories["home_page"]) {
        return popularTitles
          .filter((title) => cards[title])
          .map((title) => cards[title])
          .filter((card) => categories["home_page"].cards.includes(card.id));
      }
    }
    return [];
  }, [categories, cards, homeId]);

  //console.log(JSON.stringify(homeCards, null, 2));

  //const titledList = useMemo(() => {
  //  return createListData(homeCards, "Home:", numColumns);
  //}, [homeCards, numColumns]);

  if (loading) {
    // while user tokens are being read or data is still loading, show loading indicator
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Text style={styles.h1}>On‑device LLM demo</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a prompt"
        value={prompt}
        onChangeText={setPrompt}
      />
      <Button title="Generate" onPress={onSend} />
      <Text style={styles.reply}>{reply}</Text>
      <CardList
        //data={homeCards.slice(20)}
        data={homeCards?.filter(Boolean)}
        page={"home"}
        maxCardWidth={160}
        minColumns={2}
        cardAspectRatio={1}
      />
    </>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, padding: 24, gap: 16 },
  h1: { fontSize: 22, fontWeight: "600", padding: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 6 },
  reply: { marginTop: 12, fontSize: 16 },
});

export default HomePage;
