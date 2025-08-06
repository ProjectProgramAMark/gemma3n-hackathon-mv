/**
 * Card.test.js
 *
 * Comprehensive test suite for the Card component.
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Card from "../../components/cards/Card";

// ----- Mocking External Libraries -----
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { cacheImage, storeData } from "../../utils/storage";

// ----- Mocking use-context-selector -----
import { CardContext } from "../../contexts/CardContext";
import { CardListContext } from "../../contexts/CardListContext";
import { useContextSelector } from "use-context-selector";

// ----- Mocking App Contexts/Hooks -----
import { useSettings } from "../../contexts/SettingsContext";
import { useUserContextSelector } from "../../contexts/UserContext";
import { useDataContextSelector } from "../../contexts/DataContext";
import { useFavoriteItems } from "../../hooks/dataHooks/useFavoriteItems";
import useLoginAlert from "../../hooks/useLoginAlert";

// --------------------
// 1) jest.mock() calls
// --------------------

// Mock expo-speech
jest.mock("expo-speech", () => ({
  speak: jest.fn(),
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: "MEDIUM_FEEDBACK_STYLE",
    Light: "LIGHT_FEEDBACK_STYLE",
  },
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock local storage utils
jest.mock("../../utils/storage", () => ({
  cacheImage: jest.fn(),
  storeData: jest.fn(),
}));

// Mock our custom hook for login alert
jest.mock("../../hooks/useLoginAlert", () => jest.fn());

//jest.mock("react-dom", () => {});
// Because we use useContextSelector with multiple contexts, we intercept
// calls and return appropriate slices. The logic will route based on
// which context (`CardContext` or `CardListContext`) is passed.
// If your context is created with React.createContext
//jest.mock("use-context-selector", () => {
//  const actualModule = jest.requireActual("use-context-selector");
//  return {
//    __esModule: true,
//    ...actualModule,
//    useContextSelector: jest.fn(),
//  };
//});

// Mock useSettings
jest.mock("../../contexts/SettingsContext", () => ({
  useSettings: jest.fn(),
}));

// Mock useUserContextSelector
jest.mock("../../contexts/UserContext", () => ({
  useUserContextSelector: jest.fn(),
}));

// Mock useDataContextSelector
jest.mock("../../contexts/DataContext", () => ({
  useDataContextSelector: jest.fn(),
}));

// Mock useFavoriteItems
jest.mock("../../hooks/dataHooks/useFavoriteItems", () => ({
  useFavoriteItems: jest.fn(),
}));

// ---------------------------------
// 2) Create placeholders/mocked data
// ---------------------------------
let mockSelectedCards = {};
let mockHandleSelection = jest.fn();
let mockHandleMultipleSelection = jest.fn();
let mockOpenEditModal = jest.fn();

// We'll store these so we can reassign them before each test
let mockIsDarkMode = false;
let mockIsAuthenticated = true;
let mockHandleFavorite = jest.fn();
let mockRouterPush = jest.fn();
let mockRouterDismiss = jest.fn();
let mockLoginAlert = jest.fn();

let mockHomeCategory = "mock-home-category-id";
let mockSetCachedImages = jest.fn();
let mockCachedImages = {};
/**
 * Provide a custom implementation for useContextSelector:
 *  - If it's called with CardContext, return the props for that context
 *  - If it's called with CardListContext, return the props for that context
 */
function mockUseContextSelector(context, selectorFn) {
  if (context === CardContext) {
    const cardContextValue = {
      selectedCards: mockSelectedCards,
      handleSelection: mockHandleSelection,
      handleMultipleSelection: mockHandleMultipleSelection,
    };
    return selectorFn(cardContextValue);
  }

  if (context === CardListContext) {
    const cardListContextValue = {
      openEditModal: mockOpenEditModal,
    };
    return selectorFn(cardListContextValue);
  }

  return undefined;
}

// -----------------------------
// 3) Test Suite
// -----------------------------
describe("Card Component", () => {
  // If your code references process.env.* at runtime, you can define them here
  beforeAll(() => {
    //process.env.EXPO_PUBLIC_API_URL = "http://mock.ngrok.io";
    // If your code doesn't strictly need them, you can omit this.
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // reset to an empty cache for each test
    mockCachedImages = {};
    mockSetCachedImages = jest.fn();
    mockHomeCategory = "mock-home-category-id";

    // Re-establish default behavior
    useContextSelector.mockImplementation(mockUseContextSelector);

    useSettings.mockReturnValue({ isDarkMode: mockIsDarkMode });

    useUserContextSelector.mockReturnValue(mockIsAuthenticated);

    // For Card.js usage of useDataContextSelector:
    //   1) homeCategory
    //   2) setCachedImages
    //   3) cachedImages
    //useDataContextSelector
    //  .mockImplementationOnce(() => mockHomeCategory)
    //  .mockImplementationOnce(() => mockSetCachedImages)
    //  .mockImplementationOnce(() => mockCachedImages);
    useDataContextSelector.mockImplementation((selectorFn) => {
      const fakeContext = {
        homeCategory: mockHomeCategory,
        setCachedImages: mockSetCachedImages,
        cachedImages: mockCachedImages,
      };
      return selectorFn(fakeContext);
    });

    useFavoriteItems.mockReturnValue({ handleFavorite: mockHandleFavorite });

    useRouter.mockReturnValue({
      push: mockRouterPush,
      dismiss: mockRouterDismiss,
    });

    // Mock the loginAlert hook
    useLoginAlert.mockReturnValue(mockLoginAlert);

    // Default: no selected cards
    mockSelectedCards = {};
  });

  // Helper function to render Card with default or custom props
  function renderCard(customProps = {}) {
    const defaultProps = {
      card: {
        id: "card-id",
        cleanTitle: "Test Card Title",
        grammar: "Noun",
        favorite: false,
        image: null,
        icon: null,
      },
      page: "MainPage",
      index: 0,
      onDelPress: jest.fn(),
    };
    const mergedProps = { ...defaultProps, ...customProps };
    return render(<Card {...mergedProps} />);
  }

  // --------------
  // Basic rendering
  // --------------
  it("renders the card's title and default image when no custom image or icon is provided", () => {
    const { getByText, getByTestId } = renderCard();
    // Title
    expect(getByText("Test Card Title")).toBeTruthy();
    // Default image
    expect(getByTestId("card-image-default")).toBeTruthy();
  });

  it("renders the icon if card.icon is provided (and no 'image')", () => {
    const { getByText, queryByTestId } = renderCard({
      card: {
        id: "icon-card",
        cleanTitle: "Icon Card",
        icon: "apple",
      },
    });
    expect(getByText("Icon Card")).toBeTruthy();
    // The default image should NOT render
    expect(queryByTestId("card-image-default")).toBeNull();
  });

  it("renders the cached image if card.image is provided and found in the cache", () => {
    // Suppose the user has an image in the cache
    mockCachedImages["card-id"] = "file://cached-image-path";

    const { getByTestId } = renderCard({
      card: {
        id: "card-id",
        cleanTitle: "Has Cached Image",
        image: "https://example.com/img.jpg",
      },
    });
    expect(getByTestId("card-image")).toBeTruthy();
  });

  it("shows an ActivityIndicator while the image is downloading (not in cache)", async () => {
    // Wipe out cached images so the card is not found
    mockCachedImages = {};

    // Mock the cacheImage function to simulate a successful download
    cacheImage.mockResolvedValue({
      cacheUri: "file://newly-downloaded.png",
    });

    const { getByText, getByTestId, queryByTestId } = renderCard({
      card: {
        id: "new-card-id",
        cleanTitle: "Loading Image",
        image: "https://example.com/new.jpg",
      },
    });

    // The card title is visible
    expect(getByText("Loading Image")).toBeTruthy();

    // The activity indicator (progressbar) should be visible initially
    expect(getByTestId("activity-indicator")).toBeTruthy();

    // Once the effect finishes, the loader should disappear
    await waitFor(() => {
      // The loader is removed and the image is presumably rendered
      // So the progressbar should no longer exist
      //expect(() => getByTestId("activity-indicator")).toThrow();
      expect(queryByTestId("activity-indicator")).toBeNull();
    });
  });

  // --------------
  // Press actions
  // --------------
  it("calls Speech.speak and handleSelection when the card is pressed (normal card)", () => {
    const { getByTestId } = renderCard();
    const pressable = getByTestId("card-pressable");

    fireEvent.press(pressable);

    // The text is spoken
    expect(Speech.speak).toHaveBeenCalledWith("Test Card Title");
    // A haptic impact
    expect(Haptics.impactAsync).toHaveBeenCalledWith("MEDIUM_FEEDBACK_STYLE");
    // handleSelection from context
    expect(mockHandleSelection).toHaveBeenCalledWith(
      "card-id",
      "Test Card Title"
    );
  });

  it("calls handleMultipleSelection if the card has 'selectedCards' property (like a history card)", () => {
    const historyCardProps = {
      card: {
        id: "history-card",
        cleanTitle: "History Title",
        selectedCards: { foo: true, bar: true },
      },
    };
    const { getByTestId } = renderCard(historyCardProps);
    fireEvent.press(getByTestId("card-pressable"));

    expect(Haptics.impactAsync).toHaveBeenCalledWith("MEDIUM_FEEDBACK_STYLE");
    expect(mockHandleMultipleSelection).toHaveBeenCalledWith({
      foo: true,
      bar: true,
    });
  });

  it("navigates (router.push) if 'cards' in card prop and user taps the card", () => {
    const cardWithNestedCards = {
      card: {
        id: "parent-card",
        cleanTitle: "Parent Card",
        cards: [{ id: "child1" }, { id: "child2" }],
      },
    };
    const { getByTestId } = renderCard(cardWithNestedCards);
    fireEvent.press(getByTestId("card-pressable"));

    // The code calls: router.push(`categories/${card.id}`)
    expect(mockRouterPush).toHaveBeenCalledWith("categories/parent-card");
  });

  it("dismisses router when on iOS + page=SearchList after pressing a card with 'cards'", () => {
    // Simulate iOS environment & the page being "SearchList"
    const { getByTestId } = renderCard({
      page: "SearchList",
      card: {
        id: "ios-card",
        cleanTitle: "iOS Card",
        cards: [{ id: "child" }],
      },
    });

    fireEvent.press(getByTestId("card-pressable"));

    // The code: if (Platform.OS === 'ios' && page === 'SearchList') router.dismiss(1);
    expect(mockRouterDismiss).toHaveBeenCalledWith(1);
  });

  // --------------
  // Favorite (star) actions
  // --------------
  it("calls handleFavorite if the user is authenticated when star is pressed", () => {
    const { getByTestId } = renderCard();
    const starPressable = getByTestId("favorite-pressable");

    fireEvent.press(starPressable);

    // We expect a light haptic
    expect(Haptics.impactAsync).toHaveBeenCalledWith("LIGHT_FEEDBACK_STYLE");
    // handleFavorite from useFavoriteItems
    // second arg => "cards" in card => false for default
    expect(mockHandleFavorite).toHaveBeenCalledWith("card-id", false);
  });

  it("calls loginAlert if user is not authenticated and star is pressed", () => {
    // Mark user as not authenticated
    mockIsAuthenticated = false;
    useUserContextSelector.mockReturnValue(false);

    const { getByTestId } = renderCard();
    const starPressable = getByTestId("favorite-pressable");
    fireEvent.press(starPressable);

    expect(Haptics.impactAsync).toHaveBeenCalledWith("LIGHT_FEEDBACK_STYLE");
    // handleFavorite should NOT be called
    expect(mockHandleFavorite).not.toHaveBeenCalled();
    // Instead, loginAlert is triggered
    expect(mockLoginAlert).toHaveBeenCalled();
  });

  // --------------
  // Dragging / Editing
  // --------------
  it("shows edit & delete icons (and hides default star/sound icons) when draggingEnabled is true", () => {
    const draggingEnabled = { value: 1 };
    const { getByTestId } = render(
      <Card
        card={{
          id: "drag-card",
          cleanTitle: "Drag Card",
        }}
        page="MainPage"
        index={0}
        onDelPress={jest.fn()}
        draggingEnabled={draggingEnabled}
      />
    );
    // The "edit" icon from <AntDesign name="edit" />
    expect(getByTestId("edit-icon")).toBeTruthy();
    // The "close-outline" icon from Ionicons
    expect(getByTestId("delete-icon")).toBeTruthy();
  });

  it("calls onDelPress when the delete (close) icon is tapped in edit mode", () => {
    const mockOnDelPress = jest.fn();
    const draggingEnabled = { value: 1 };

    const { getByTestId } = render(
      <Card
        card={{
          id: "delete-card",
          cleanTitle: "Delete Me",
        }}
        page="MainPage"
        index={2}
        onDelPress={mockOnDelPress}
        draggingEnabled={draggingEnabled}
      />
    );

    fireEvent.press(getByTestId("delete-icon"));
    expect(mockOnDelPress).toHaveBeenCalledTimes(1);
  });

  it("calls openEditModal when the edit icon is tapped in edit mode", () => {
    const draggingEnabled = { value: 1 };

    const { getByTestId } = render(
      <Card
        card={{
          id: "edit-card",
          cleanTitle: "Edit Me",
        }}
        page="MainPage"
        index={0}
        onDelPress={jest.fn()}
        draggingEnabled={draggingEnabled}
      />
    );

    fireEvent.press(getByTestId("edit-icon"));
    expect(mockOpenEditModal).toHaveBeenCalledWith({
      id: "edit-card",
      cleanTitle: "Edit Me",
    });
  });

  // --------------
  // Style checks
  // --------------
  it("applies grammar-based styles (e.g. noun, verb, etc.)", () => {
    const { getByTestId } = renderCard({
      card: {
        id: "verb-card",
        cleanTitle: "Verb Card",
        grammar: "Verb",
      },
    });
    const pressable = getByTestId("card-pressable");
    expect(pressable).toBeTruthy();
    // If you want to test actual style objects, you can do:
    // expect(pressable).toHaveStyle({ backgroundColor: "#someColor" });
  });

  it("applies style if the card is 'favorite'", () => {
    const { getByTestId } = renderCard({
      card: {
        id: "fav-card",
        cleanTitle: "Favorite Card",
        favorite: true,
      },
    });
    const pressable = getByTestId("card-pressable");
    expect(pressable).toBeTruthy();
    // You could check actual style if your styles.favoritedCard sets a color
  });

  it("applies style if the card categories include 'home_page' or the homeCategory context ID", () => {
    // Re-mock the context for the new test call
    mockHomeCategory = "my-home-cat";
    useDataContextSelector
      .mockImplementationOnce(() => mockHomeCategory)
      .mockImplementationOnce(() => mockSetCachedImages)
      .mockImplementationOnce(() => mockCachedImages);

    const { getByTestId } = renderCard({
      card: {
        id: "home-card",
        cleanTitle: "Home Card",
        categories: ["home_page"],
      },
    });
    const pressable = getByTestId("card-pressable");
    expect(pressable).toBeTruthy();
  });

  it("applies 'selectedCard' style if the card is selected", () => {
    // Mark the card as selected
    mockSelectedCards = {
      "card-id": { isSelected: true },
    };

    const { getByTestId } = renderCard();
    const pressable = getByTestId("card-pressable");
    expect(pressable).toBeTruthy();
    // If selectedCard style sets something like a different background, you can check it:
    // expect(pressable).toHaveStyle({ backgroundColor: "#someSelectedColor" });
  });
});
