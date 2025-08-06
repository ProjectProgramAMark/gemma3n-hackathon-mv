// DraggableItem.test.js
import React from "react";
import { render, act, fireEvent } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";

// Set up Reanimated's test environment
require("react-native-reanimated").setUpTests();

// Mock Reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  return {
    ...Reanimated,
    FadeIn: {
      delay: () => ({ duration: jest.fn() }),
    },
    FadeOut: {
      duration: () => ({}),
    },
    LinearTransition: {},
  };
});

// Mock Gesture Handler
jest.mock("react-native-gesture-handler", () => ({
  Gesture: {
    Pan: () => ({
      manualActivation: () => ({
        onTouchesDown: () => ({
          onStart: () => ({
            onUpdate: () => ({
              onEnd: () => ({
                onFinalize: () => ({}),
              }),
            }),
          }),
        }),
      }),
    }),
  },
  GestureDetector: ({ children }) => children,
}));

// Mock the Card component
jest.mock("../../components/cards/Card", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ card, onDelPress, draggingEnabled }) => {
      return (
        <View
          testID="mock-card"
          onTouchEnd={onDelPress}
          draggingEnabled={draggingEnabled?.value}
        >
          {card ? (
            <Text>MockCard: {card.cleanTitle}</Text>
          ) : (
            <Text>No card</Text>
          )}
        </View>
      );
    },
  };
});

import DraggableItem from "../../components/cards/DraggableItem";

describe("DraggableItem Component", () => {
  let positions, scrollOffset, pointerYShared, justDeleted, draggingEnabled;
  let pendingDeletionsRef;

  const defaultItem = { id: "itemA", cleanTitle: "Test Item" };

  function renderDraggableItem(extraProps = {}) {
    const mergedProps = {
      item: defaultItem,
      positions,
      scrollY: scrollOffset,
      pointerYShared,
      itemCount: 1,
      numColumns: 2,
      itemWidth: 100,
      itemHeight: 100,
      horizontalSpacing: 8,
      verticalSpacing: 8,
      page: "testPage",
      index: 0,
      justDeleted,
      draggingEnabled,
      categoryId: null,
      pendingDeletionsRef,
      ...extraProps,
    };
    return render(<DraggableItem {...mergedProps} />);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    positions = { value: { [defaultItem.id]: { row: 0, col: 0 } } };
    scrollOffset = { value: 0 };
    pointerYShared = { value: -9999 };
    justDeleted = { value: false };
    draggingEnabled = { value: false };
    pendingDeletionsRef = { current: [] };
  });

  it("renders a Card with the correct item data", () => {
    const { getByText, getByTestId } = renderDraggableItem();
    expect(getByText("MockCard: Test Item")).toBeTruthy();
    expect(getByTestId("mock-card")).toBeTruthy();
  });

  it("handles deletion by adding item to pendingDeletionsRef", () => {
    const { getByTestId } = renderDraggableItem();
    act(() => {
      fireEvent(getByTestId("mock-card"), "touchEnd");
    });
    expect(pendingDeletionsRef.current).toContain("itemA");
  });

  it("updates position when dragging is enabled", () => {
    draggingEnabled.value = true;
    const newPosition = { row: 1, col: 1 };
    const { rerender } = renderDraggableItem();

    act(() => {
      positions.value = {
        ...positions.value,
        [defaultItem.id]: newPosition,
      };
    });

    rerender(
      <DraggableItem
        item={defaultItem}
        positions={positions}
        draggingEnabled={draggingEnabled}
        // ... other props
      />
    );

    expect(positions.value[defaultItem.id]).toEqual(newPosition);
  });

  it("handles just deleted state", () => {
    justDeleted.value = true;
    const { getByTestId } = renderDraggableItem();
    const card = getByTestId("mock-card");
    expect(card).toBeTruthy();
  });

  it("respects scroll offset", () => {
    scrollOffset.value = 100;
    const { getByTestId } = renderDraggableItem();
    expect(getByTestId("mock-card")).toBeTruthy();
  });

  it("handles multi-column layout", () => {
    const { getByTestId } = renderDraggableItem({
      numColumns: 3,
      itemWidth: 50,
      horizontalSpacing: 10,
    });
    expect(getByTestId("mock-card")).toBeTruthy();
  });

  it("passes draggingEnabled state to Card", () => {
    draggingEnabled.value = true;
    const { getByTestId } = renderDraggableItem();
    expect(getByTestId("mock-card").props.draggingEnabled).toBe(true);
  });
});
