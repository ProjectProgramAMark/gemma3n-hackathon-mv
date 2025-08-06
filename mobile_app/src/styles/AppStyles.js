import { StyleSheet, Platform } from "react-native";
import Colors from "./Colors";

const lightStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* Navigation Drawer & Header */
  drawerIcon: {
    marginRight: 10, // Add spacing between icon and text
  },
  drawerActiveBackground: {
    backgroundColor: Colors.primary,
  },
  drawerActiveTint: {
    color: "#fff",
  },
  headerTitle: {
    fontFamily: "mon-sb, sans-serif",
    color: "#fff",
  },
  headerBackground: {
    backgroundColor: Colors.primary,
  },

  /* CardList */
  cardList: {
    flex: 1,
    //zIndex: 1,
    //backgroundColor: '#fff',
  },
  cardItemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleItemContainer: {
    justifyContent: "flex-end",
  },
  cardGroupTitle: {
    width: "100%",
    fontFamily: "mon, sans-serif",
    fontSize: 35,
    color: Colors.grey,
    textShadowColor: "#fff",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  emptyItemContainer: {
    flex: 1,
    justifyContent: "center",
  },
  noResultsFoundContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsFoundText: {
    fontSize: 30,
    fontFamily: "mon, sans-serif",
  },
  noResultsFoundIcon: {
    paddingLeft: 10,
  },

  /* Card */
  card: {
    flex: 1,
    width: "100%",
    borderRadius: 20,
    borderColor: Colors.grey,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    flexDirection: "column",
    backgroundColor: Colors.white,
  },
  selectedCard: {
    borderColor: Colors.green,
  },
  cardImage: {
    width: "100%",
    flex: 4, //80% of pressable
    resizeMode: "contain",
    borderRadius: 15,
    marginTop: 0,
  },
  cardImageCustom: {
    width: "100%",
    flex: 4, //80% of pressable
    resizeMode: "cover",
    borderRadius: 15,
    top: -4,
    marginTop: -20,
    //marginTop: -23, //image as background to favorite star / sound icon
    //marginTop: 20, //image below favorite star / sound icon
  },

  cardHistoryContainer: {
    marginVertical: 10,
    flex: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  cardHistoryText: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  cardTitle: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 20,
    textAlign: "center",
    color: "#000000",
    paddingHorizontal: 5,
    flex: 1,
  },
  cardIconsContainer: {
    zIndex: 100,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignSelf: "stretch",
    marginHorizontal: 6,
    marginBottom: -20,
  },

  /* Card Types */
  favoritedCard: {
    backgroundColor: Colors.favorite,
  },
  recent: {
    backgroundColor: Colors.recent,
  },
  popular: {
    backgroundColor: Colors.popular,
  },
  custom: {
    backgroundColor: Colors.custom,
  },
  verb: {
    backgroundColor: Colors.verb,
  },
  noun: {
    backgroundColor: Colors.noun,
  },
  letter: {
    backgroundColor: Colors.letter,
  },

  /* SearchBar */
  searchBarContainer: {
    //position: 'absolute',
    //top: 100,
    //flex: 1,
    width: 200,
    paddingHorizontal: 20,
    //height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c2c2c2",
    borderRadius: 25,
    paddingLeft: 10,
    backgroundColor: "#f8f8f8",
    //backgroundColor: 'green',
    //shadow stuff
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  searchTextInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
  },

  /* ResponseContainer */
  responseContainer: {
    position: "absolute",
    bottom: 0,
    //backgroundColor: 'rgba(80, 148, 217, 0.25)',
    //paddingBottom: Platform.OS === 'ios' ? 10 : 0,
    //backgroundColor: "rgba(80, 148, 217, 0.25)",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  responseContainerSelectedCards: {
    //paddingBottom: Platform.OS === "ios" ? 20 : 10,
    flexDirection: "column",
    flex: 1,
  },

  /* SelectedCardsList */
  selectedCardsListContainer: {
    flexDirection: "row",
    alignItems: "center",
    //backgroundColor: Colors.primary,
    //backgroundColor: 'rgba(80, 148, 217, 0.25)',
    gap: 10,
  },
  selectedCardsScrollView: {
    flex: 1,
    maxHeight: 140,
  },
  selectedCardsScrollViewContentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedCardsItem: {
    backgroundColor: Colors.green,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCardsItemText: {
    fontSize: 16,
    color: "#000",
  },

  /* GeneratedResponse */
  generatedResponseContainer: {
    //backgroundColor: 'rgba(80, 148, 217, 0.25)',
    //backgroundColor: Colors.white,
    flex: 1,
    justifyContent: "flex-end",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    //paddingBottom: 10
  },
  userEditContainer: {
    paddingHorizontal: 10,
    width: "100%",
    //paddingBottom: 15,
  },
  userEditQuestion: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  userEditQuestionText: {
    //flexDirection: 'row',
    marginBottom: 3,
    alignSelf: "center",
    fontSize: 20,
    marginHorizontal: 10,
    color: Colors.primary,
    fontFamily: "mon-sb, sans-serif",
    textShadowColor: Colors.white,
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  userInputContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  userEditTextInputContainer: {
    flex: 1,
  },
  userEditTextInput: {
    padding: 8,
    backgroundColor: Colors.white,
    //color: Colors.grey,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    fontSize: 16,
    paddingBottom: 16,
  },
  regeneratedTextButton: {
    paddingHorizontal: 10,
    alignSelf: "center",
    justifyContent: "center",
  },
  generatedTextContainer: {
    flexDirection: "row",
    width: "100%",
    paddingLeft: 10,
  },
  llmGeneratedTextContainer: {
    flex: 1,
  },
  llmGeneratedText: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 16,
    textAlign: "left",
    color: Colors.black,
  },
  feedbackContainer: {
    width: "100%",
  },
  ratingContainer: {
    paddingBottom: 10,
    flexDirection: "row",
    width: "100%",
  },
  ratingQuestion: {
    flex: 3, // 1/2 of width
    fontFamily: "mon-sb, sans-serif",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  ratingQuestionText: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 16,
    color: Colors.black,
  },
  regenerateButton: {
    flex: 1,
  },
  thumbsUp: {
    flex: 1, // 1/6 of width
  },
  thumbsDown: {
    flex: 1, // 1/6 of width
  },
  audioIcon: {
    justifyContent: "center",
    alignSelf: "center",
    paddingHorizontal: 10,
  },

  /* LoadingContainer */
  loadingContainer: {
    //backgroundColor: 'rgba(80, 148, 217, 0.25)',
    //backgroundColor: Colors.white,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  loadingText: {
    fontFamily: "mon, sans-serif",
    fontSize: 16,
    color: Colors.black,
  },

  /* CategoryList */
  categoryContainer: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.black,
    backgroundColor: Colors.white, // Change background based on selection
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5, // Spacing between items
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    color: "#000", // Change text color based on selection
  },
  selectedCategoryText: {
    color: "#fff",
  },

  /* PackPage = [category].js */
  packPageContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    justifyContent: "space-between",
  },
  packPageBackButton: {
    alignSelf: "center",
    flexDirection: "row",
    paddingLeft: 10,
  },
  packPageBackButtonText: {
    paddingLeft: 5,
    fontFamily: "mon, sans-serif",
    fontSize: 24,
    color: Colors.primary,
  },
  packTitleContainer: {
    flex: 1,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  packTitleText: {
    backgroundColor: Colors.white,
    textAlign: "center",
    fontSize: 36,
    fontFamily: "mon-sb, sans-serif",
    marginHorizontal: 10,
    flexShrink: 1,
  },

  /* PredictedCardsBar */
  predictedCardsBar: {
    //position: "absolute",
    //bottom: 80, // Adjust as needed to ensure it stays above the sentence generator
    left: 0,
    right: 0,
    //backgroundColor: "#fff",
    //borderTopLeftRadius: 15,
    //borderTopRightRadius: 15,
    paddingTop: 5,
    elevation: 5, // Elevation for Android
    zIndex: 3, // Ensure this is higher than your sentence generator
  },
  predictedCardsContainer: {
    flexDirection: "row",
    //justifyContent: "space-around",
  },

  homeScreenButton: {
    fontFamily: "mon, sans-serif",
    fontSize: 22,
    paddingTop: 10,
    color: Colors.primary,
  },

  boardTitle: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 35,
    textAlign: "center",
    paddingVertical: 10,
  },
});

const darkStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /* CardList */
  cardList: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "#fff",
  },
  cardItemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleItemContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardGroupTitle: {
    fontFamily: "mon, sans-serif",
    fontSize: 35,
    color: Colors.grey,
    textShadowColor: "#fff",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  emptyItemContainer: {
    flex: 1,
    justifyContent: "center",
  },
  noResultsFoundContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsFoundText: {
    fontSize: 30,
    fontFamily: "mon, sans-serif",
  },
  noResultsFoundIcon: {
    paddingLeft: 10,
  },

  /* Card */
  card: {
    flex: 1,
    //width: "100%",
    borderRadius: 20,
    borderColor: Colors.grey,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    flexDirection: "column",
    backgroundColor: Colors.white,
    elevation: 10, // for Android
    shadowColor: "#000", // for iOS
    shadowOffset: { width: 0, height: 4 }, // for iOS
    shadowOpacity: 0.3, // for iOS
    shadowRadius: 4, // for iOS
  },
  selectedCard: {
    borderColor: Colors.green,
    elevation: 0, // lower elevation for Android
    shadowOffset: { width: 0, height: 0 }, // lower shadow for iOS
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  cardImage: {
    width: "100%",
    flex: 4, //80% of pressable
    resizeMode: "contain",
    borderRadius: 15,
    marginTop: -14,
  },
  cardImageCustom: {
    width: "100%",
    flex: 4, //80% of pressable
    resizeMode: "cover",
    borderRadius: 15,
    top: -4,
    marginTop: -20,
    //marginTop: -10,
    //marginTop: -23, //image as background to favorite star / sound icon
    //marginTop: 20, //image below favorite star / sound icon
  },
  cardGeneratedText: {
    flex: 4,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  cardTitle: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 20,
    textAlign: "center",
    color: "#000000",
    paddingHorizontal: 5,
    flex: 1,
  },
  cardIconsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    alignSelf: "stretch",
    marginTop: 6,
    marginHorizontal: 6,
    marginBottom: -20,
    zIndex: 1,
  },

  /* Card Types */
  favoritedCard: {
    backgroundColor: Colors.favorite,
  },
  recent: {
    backgroundColor: Colors.recent,
  },
  popular: {
    backgroundColor: Colors.popular,
  },
  custom: {
    backgroundColor: Colors.custom,
  },
  verb: {
    backgroundColor: Colors.verb,
  },
  noun: {
    backgroundColor: Colors.noun,
  },
  letter: {
    backgroundColor: Colors.letter,
  },

  /* SearchBar */
  searchBarContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c2c2c2",
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: "#f8f8f8",
    //shadow stuff
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  searchTextInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
  },

  /* ResponseContainer */
  responseContainer: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    //justifyContent: "space-between",
    zIndex: 2,
  },
  responseContainerSelectedCards: {
    flexDirection: "column",
    flex: 1,
  },

  /* SelectedCardsList */
  selectedCardsListContainer: {
    flexDirection: "row",
    alignItems: "center",
    //backgroundColor: 'rgba(74, 144, 226, 0.25)',
  },
  selectedCardsScrollView: {
    flex: 1,
    maxHeight: 140,
  },
  selectedCardsScrollViewContentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  selectedCardsItem: {
    backgroundColor: Colors.green,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCardsItemText: {
    fontSize: 16,
    color: "#000",
  },

  /* GeneratedResponse */
  generatedResponseContainer: {
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: "flex-end",
    paddingVertical: 10,
  },
  userEditContainer: {
    paddingLeft: 10,
    width: "100%",
  },
  userEditQuestion: {
    flexDirection: "row",
    width: "100%",
  },
  userEditQuestionText: {
    flexDirection: "row",
    marginVertical: 10,
    fontSize: 16,
    marginRight: 10,
    color: Colors.grey,
  },
  userInputContainer: {
    flexDirection: "row",
    width: "100%",
  },
  userEditTextInputContainer: {
    flex: 8,
  },
  userEditTextInput: {
    padding: 8,
    backgroundColor: Colors.green,
    color: Colors.grey,
    borderRadius: 15,
  },
  regeneratedTextButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  generatedTextContainer: {
    flexDirection: "row",
    width: "100%",
    paddingLeft: 10,
  },
  llmGeneratedTextContainer: {
    flex: 8,
  },
  llmGeneratedText: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 16,
    textAlign: "left",
    color: Colors.black,
  },
  llmGeneratedTextThumbsDown: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 16,
    textAlign: "left",
    color: Colors.black,
  },
  feedbackContainer: {
    width: "100%",
  },
  ratingContainer: {
    paddingBottom: 10,
    flexDirection: "row",
    width: "100%",
  },
  ratingQuestion: {
    flex: 3, // 1/2 of width
    fontFamily: "mon-sb, sans-serif",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  ratingQuestionText: {
    fontFamily: "mon-sb, sans-serif",
    fontSize: 16,
    color: Colors.black,
  },
  regenerateButton: {
    flex: 1,
  },
  thumbsUp: {
    flex: 1, // 1/6 of width
  },
  thumbsDown: {
    flex: 1, // 1/6 of width
  },
  audioIcon: {
    justifyContent: "center",
    alignItems: "center",
    flex: 2,
    paddingLeft: 10,
  },

  /* LoadingContainer */
  loadingContainer: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  loadingText: {
    fontFamily: "mon, sans-serif",
    fontSize: 16,
    color: Colors.grey,
  },

  /* CategoryList */
  categoryContainer: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.black,
    backgroundColor: Colors.white, // Change background based on selection
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5, // Spacing between items
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    color: "#000", // Change text color based on selection
  },
  selectedCategoryText: {
    color: "#fff",
  },

  /* PackPage = [category].js */
  packPageContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    justifyContent: "space-between",
  },
  packPageBackButton: {
    alignSelf: "center",
    flexDirection: "row",
    paddingLeft: 10,
  },
  packPageBackButtonText: {
    paddingLeft: 5,
    fontFamily: "mon, sans-serif",
    fontSize: 24,
    color: Colors.primary,
  },
  packTitleContainer: {
    flex: 1,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  packTitleText: {
    backgroundColor: Colors.white,
    textAlign: "center",
    fontSize: 36,
    fontFamily: "mon-sb, sans-serif",
    marginHorizontal: 10,
    flexShrink: 1,
  },
});

export { lightStyles, darkStyles };
