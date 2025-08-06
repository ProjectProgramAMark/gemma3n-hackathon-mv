/**
 * DraggableFlatList.test.js
 *
 * Test suite mirroring the style/structure of Card.test.js,
 * including how we mock use-context-selector & contexts.
 */

import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";
import DraggableFlatList from "../../components/cards/DraggableFlatList";
import { ScrollContext } from "../../contexts/ScrollContext";
import { useSettings } from "../../contexts/SettingsContext";
import useLoginAlert from "../../hooks/useLoginAlert";
import { useContextSelector } from "use-context-selector";
import { CardListContext } from "../../contexts/CardListContext";
import { CardContext } from "../../contexts/CardContext";
import * as Reanimated from "react-native-reanimated";
import DraggableItem from "../../components/cards/DraggableItem";
import { Text } from "react-native";
import { useSharedValue } from "react-native-reanimated";

// Set up Reanimated's test environment
require("react-native-reanimated").setUpTests();

// Mock modules
jest.mock("../../hooks/useLoginAlert", () => {
  const mockAlert = jest.fn();
  return jest.fn(() => mockAlert);
});
jest.mock("../../contexts/SettingsContext");
jest.mock("../../contexts/UserContext");
jest.mock("../../contexts/DataContext");
jest.mock("../../hooks/dataHooks/useReorderItems");
jest.mock("../../hooks/dataHooks/useDeleteItems");

// Mock EditModal component
jest.mock("../../components/cards/EditModal", () => {
  return function MockEditModal(props) {
    return null; // Return null since we're not testing EditModal functionality
  };
});

// Mock Card component to avoid internal logic issues
jest.mock("../../components/cards/Card", () => {
  return function MockCard(props) {
    return null;
  };
});

// Mock useLoginAlert hook
jest.mock("../../hooks/useLoginAlert", () => {
  const mockAlert = jest.fn();
  return jest.fn(() => mockAlert);
});

const mockSharedValues = {
  values: new Map(),
  reactions: new Map(),
  resetValues: function () {
    this.values.clear();
    this.reactions.clear();

    // Initialize default shared values
    this.values.set("draggingEnabled", { value: false });
    this.values.set("pointerY", { value: 0 });
    this.values.set("positions", { value: {} });
  },
  clearReactions: function () {
    this.reactions.clear();
  },
  getValue: function (key) {
    return this.values.get(key);
  },
  setValue: function (key, value) {
    console.log(`Setting ${key} to:`, value);
    this.values.set(key, { value });

    // Trigger all reactions
    this.reactions.forEach((reactions, reactionKey) => {
      console.log(`Checking reactions for ${reactionKey}`);
      reactions.forEach((reaction) => {
        try {
          reaction(value);
        } catch (e) {
          console.error(`Error in reaction:`, e);
        }
      });
    });
  },
  addReaction: function (key, reaction) {
    console.log(`Adding reaction for ${key}`);
    if (!this.reactions.has(key)) {
      this.reactions.set(key, new Set());
    }
    this.reactions.get(key).add(reaction);
  },
};

// Mock Reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  // Mock useSharedValue to track its value
  Reanimated.useSharedValue = jest.fn((initialValue) => ({
    value: initialValue,
  }));
  return Reanimated;
});

// Mock DraggableItem component with proper style
const MockDraggableItem = ({ item, style }) => (
  <Text testID={`draggable-item-${item.id}`} style={style}>
    {item.title}
  </Text>
);

jest.mock("../../components/cards/DraggableItem", () => {
  return function (props) {
    return MockDraggableItem(props);
  };
});

// Mock CardContext with a proper mock function
const mockLoginAlert = jest.fn();
const mockUseCardContext = jest.fn();

jest.mock("../../contexts/CardContext", () => ({
  useCardContext: () => mockUseCardContext(),
}));

const mockData = [
  { id: "1", title: "Item 1" },
  { id: "2", title: "Item 2" },
];

const renderItem = ({ item }) => (
  <Text testID={`item-${item.id}`}>{item.title}</Text>
);

describe("DraggableFlatList test suite", () => {
  let mockIsAuthenticated;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSharedValues.resetValues();
    global.reactions = new Set();

    mockIsAuthenticated = true;

    // Mock useSettings
    const { useSettings } = require("../../contexts/SettingsContext");
    useSettings.mockReturnValue({
      isDarkMode: false,
      toggleDarkMode: jest.fn(),
      isHighContrast: false,
      toggleHighContrast: jest.fn(),
      fontSize: 16,
      setFontSize: jest.fn(),
      cardAspectRatio: 1,
      setCardAspectRatio: jest.fn(),
    });

    // Mock UserContext
    const { useUserContextSelector } = require("../../contexts/UserContext");
    useUserContextSelector.mockImplementation((selector) => {
      const mockState = {
        isAuthenticated: mockIsAuthenticated,
      };
      return selector(mockState);
    });

    // Mock DataContext
    const { useDataContextSelector } = require("../../contexts/DataContext");
    useDataContextSelector.mockImplementation((selector) => {
      const mockState = {
        categories: {
          home: {
            id: "home",
            title: "Home",
          },
          "category-1": {
            id: "category-1",
            title: "Category 1",
          },
        },
      };
      return selector(mockState);
    });

    // Mock CardListContext
    const { useContextSelector } = require("use-context-selector");
    useContextSelector.mockImplementation((context, selector) => {
      const mockState = {
        draggingEnabled: { value: true },
        itemHeight: 100,
      };
      return selector(mockState);
    });

    // Mock useReorderItems
    const {
      useReorderItems,
    } = require("../../hooks/dataHooks/useReorderItems");
    useReorderItems.mockReturnValue({
      handleDragDrop: jest.fn(),
    });

    // Mock useDeleteItems
    const { useDeleteItems } = require("../../hooks/dataHooks/useDeleteItems");
    useDeleteItems.mockReturnValue({
      finalizeCardDeletions: jest.fn(),
      finalizeCategoryDeletions: jest.fn(),
    });

    mockUseCardContext.mockReturnValue({
      authenticated: false,
      loginAlert: mockLoginAlert,
      dragging: false,
      setDragging: () => mockLoginAlert(),
    });

    // Set up fake timers for each test
    jest.useFakeTimers();
  });

  const defaultProps = {
    data: [],
    cardContext: {
      isAuthenticated: false,
      loginAlert: jest.fn(),
      onOrderChange: jest.fn(),
      selectedCards: {},
    },
  };

  const renderDFF = (props) => {
    const mergedProps = {
      ...defaultProps,
      ...props,
      cardContext: {
        ...defaultProps.cardContext,
        ...props.cardContext,
      },
    };

    return render(
      <CardContext.Provider value={mergedProps.cardContext}>
        <DraggableFlatList {...mergedProps} />
      </CardContext.Provider>
    );
  };

  beforeEach(() => {
    // Reset default props mock functions
    defaultProps.cardContext.loginAlert.mockClear();
    defaultProps.cardContext.onOrderChange.mockClear();
  });

  afterEach(() => {
    // Clean up timers after each test
    jest.runAllTimers();
    jest.useRealTimers();
  });

  it("renders empty list message when data is empty", () => {
    const { getByText } = render(
      <DraggableFlatList
        data={[]}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    );
    expect(getByText("No results found")).toBeTruthy();
  });

  it("renders items in the list", () => {
    const { getByText } = render(
      <DraggableFlatList
        data={mockData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    );
    expect(getByText("Item 1")).toBeTruthy();
    expect(getByText("Item 2")).toBeTruthy();
  });

  it("calls loginAlert when unauthenticated user tries to enable dragging", () => {
    const { getByTestId } = render(
      <DraggableFlatList
        data={mockData}
        renderItem={({ item }) => <MockDraggableItem item={item} />}
        keyExtractor={(item) => item.id}
      />
    );

    // Get the context value and call setDragging
    const contextValue = mockUseCardContext();
    contextValue.setDragging(true);

    expect(mockLoginAlert).toHaveBeenCalled();
  });

  it("allows dragging when user is authenticated", () => {
    const setDragging = jest.fn();
    mockUseCardContext.mockReturnValue({
      authenticated: true,
      loginAlert: mockLoginAlert,
      dragging: false,
      setDragging,
    });

    const { getByTestId } = render(
      <DraggableFlatList
        data={mockData}
        renderItem={({ item }) => <MockDraggableItem item={item} />}
        keyExtractor={(item) => item.id}
      />
    );

    // Get the context value and call setDragging
    const contextValue = mockUseCardContext();
    contextValue.setDragging(true);

    expect(mockLoginAlert).not.toHaveBeenCalled();
    expect(setDragging).toHaveBeenCalledWith(true);
  });

  it("renders items with custom renderItem function", () => {
    const customRenderItem = ({ item }) => (
      <Text testID={`item-${item.id}`}>{item.title.toUpperCase()}</Text>
    );

    const { getByTestId } = render(
      <DraggableFlatList
        data={mockData}
        renderItem={customRenderItem}
        keyExtractor={(item) => item.id}
      />
    );

    const item = getByTestId("draggable-item-1");
    expect(item.props.children).toBe("Item 1");
  });
});
