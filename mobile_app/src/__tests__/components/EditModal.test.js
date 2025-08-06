// EditModal.test.js

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import "@testing-library/jest-native/extend-expect";

// 1) Mock Reanimated to prevent infinite loops with useAnimatedReaction
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  let lastValue;
  return {
    ...Reanimated,
    useAnimatedReaction: (prepareFn, callbackFn) => {
      const currentValue = prepareFn();
      callbackFn(currentValue, lastValue);
      lastValue = currentValue;
    },
  };
});

// 2) Mock CategoryDropDown so it never calls categories.map
jest.mock("../../components/createCards/CategoryDropDown", () => {
  return {
    __esModule: true,
    default: () => null,
  };
});

import EditModal from "../../components/cards/EditModal";
import { CardListContext } from "../../contexts/CardListContext";

import { useDataContextSelector } from "../../contexts/DataContext";
import { useUserContextSelector } from "../../contexts/UserContext";
import useLoginAlert from "../../hooks/useLoginAlert";
import { useEditItems } from "../../hooks/dataHooks/useEditItems";

jest.mock("../../contexts/DataContext", () => ({
  useDataContextSelector: jest.fn(),
}));

jest.mock("../../contexts/UserContext", () => ({
  useUserContextSelector: jest.fn(),
}));

jest.mock("../../hooks/useLoginAlert", () => jest.fn());

jest.mock("../../hooks/dataHooks/useEditItems", () => ({
  useEditItems: jest.fn(),
}));

const createMockSharedValue = (val) => ({ value: val });

describe("EditModal Component", () => {
  let mockModalVisible;
  let mockSelectedItem;

  let mockEditCardValues;
  let mockEditCategoryValues;
  let mockLoginAlert;

  const renderEditModal = (extraCtx = {}) => {
    const contextValue = {
      modalVisible: mockModalVisible,
      selectedItem: mockSelectedItem,
      ...extraCtx,
    };

    return render(
      <CardListContext.Provider value={contextValue}>
        <EditModal currentCategoryId="some-category-id" />
      </CardListContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockModalVisible = createMockSharedValue(false);
    mockSelectedItem = createMockSharedValue(null);

    // Default: user is authenticated
    useUserContextSelector.mockReturnValue(true);

    // By default, no special cached images or categories needed
    useDataContextSelector.mockReturnValue({
      categories: [],
      cachedImages: {},
    });

    // Mock the edit functions
    mockEditCardValues = jest.fn();
    mockEditCategoryValues = jest.fn();
    useEditItems.mockReturnValue({
      editCardValues: mockEditCardValues,
      editCategoryValues: mockEditCategoryValues,
    });

    mockLoginAlert = jest.fn();
    useLoginAlert.mockReturnValue(mockLoginAlert);
  });

  it("renders overlay/container even if modal is closed", () => {
    const { getByTestId } = renderEditModal();
    expect(getByTestId("edit-modal-overlay")).toBeTruthy();
    expect(getByTestId("edit-modal-container")).toBeTruthy();

    // Should have pointerEvents='none' when closed
    expect(getByTestId("edit-modal-overlay").props.pointerEvents).toBe("none");
  });

  it("pointer events are auto when modalVisible is true", () => {
    mockModalVisible.value = true;
    const { getByTestId } = renderEditModal();
    expect(getByTestId("edit-modal-overlay").props.pointerEvents).toBe("auto");
  });

  it("closes the modal when the close (X) button is pressed", async () => {
    mockModalVisible.value = true;
    mockSelectedItem.value = { id: "someItem", cleanTitle: "Title" };

    const { getByTestId } = renderEditModal();

    await act(async () => {
      fireEvent.press(getByTestId("edit-modal-close-button"));
    });

    expect(mockModalVisible.value).toBe(false);
    expect(mockSelectedItem.value).toBeNull();
  });

  it("closes the modal when the cancel button is pressed", async () => {
    mockModalVisible.value = true;
    mockSelectedItem.value = { id: "someItem", cleanTitle: "Title" };

    const { getByTestId } = renderEditModal();

    await act(async () => {
      fireEvent.press(getByTestId("edit-modal-cancel-button"));
    });
    expect(mockModalVisible.value).toBe(false);
    expect(mockSelectedItem.value).toBeNull();
  });

  /**
   * Instead of checking .toBeDisabled() on the button (which may not be set for TouchableOpacity),
   * we test the functional behavior: pressing "Save" does NOT call editCardValues/editCategoryValues
   * if nothing is changed.
   */
  it("disables the save behavior if nothing is edited (no changes)", async () => {
    mockModalVisible.value = true;
    // The item has the same title as before, same image
    mockSelectedItem.value = {
      id: "item1",
      cleanTitle: "Original Title",
      image: "http://example.com/original.png",
    };

    useDataContextSelector.mockReturnValue({
      categories: [],
      cachedImages: {
        item1: "http://example.com/original.png", // same image => no change
      },
    });

    // We'll pass an empty string for currentCategoryId so there's no category mismatch:
    const { getByTestId } = render(
      <CardListContext.Provider
        value={{
          modalVisible: mockModalVisible,
          selectedItem: mockSelectedItem,
        }}
      >
        <EditModal currentCategoryId="" />
      </CardListContext.Provider>
    );

    // Press save, expecting no backend calls
    await act(async () => {
      fireEvent.press(getByTestId("edit-modal-save-button"));
    });

    expect(mockEditCardValues).not.toHaveBeenCalled();
    expect(mockEditCategoryValues).not.toHaveBeenCalled();
  });

  /**
   * We test enabling by verifying that a change triggers the "save" logic (editCardValues).
   */
  it("enables the save behavior if the title is changed", async () => {
    mockModalVisible.value = true;
    mockSelectedItem.value = {
      id: "item2",
      cleanTitle: "Some Title",
      image: "http://example.com/original.png",
    };

    useDataContextSelector.mockReturnValue({
      categories: [],
      cachedImages: {
        item2: "http://example.com/original.png",
      },
    });

    const { getByTestId } = renderEditModal();
    const titleInput = getByTestId("edit-modal-title-input");
    const saveButton = getByTestId("edit-modal-save-button");

    // Change the title => now there's a diff
    await act(async () => {
      fireEvent.changeText(titleInput, "New Title");
    });

    // Press save => should call editCardValues
    await act(async () => {
      fireEvent.press(saveButton);
    });

    expect(mockEditCardValues).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item2" }),
      "New Title",
      expect.anything(), // selectedImage
      "some-category-id"
    );
  });

  it("calls editCardValues and closes modal when save is pressed (card item)", async () => {
    mockModalVisible.value = true;
    mockSelectedItem.value = {
      id: "card123",
      cleanTitle: "Card Title",
      image: "http://example.com/card.png",
    };

    useDataContextSelector.mockReturnValue({
      categories: [],
      cachedImages: {
        card123: "http://example.com/card.png",
      },
    });

    const { getByTestId } = renderEditModal();

    // Title is changed => enabling save
    await act(async () => {
      fireEvent.changeText(
        getByTestId("edit-modal-title-input"),
        "Updated Card Title"
      );
    });

    // Press save
    await act(async () => {
      fireEvent.press(getByTestId("edit-modal-save-button"));
    });

    expect(mockEditCardValues).toHaveBeenCalledWith(
      expect.objectContaining({ id: "card123" }),
      "Updated Card Title",
      expect.anything(),
      "some-category-id"
    );

    // Also closes the modal
    expect(mockModalVisible.value).toBe(false);
    expect(mockSelectedItem.value).toBeNull();
  });

  it("calls editCategoryValues and closes modal if item has 'cards'", async () => {
    mockModalVisible.value = true;
    mockSelectedItem.value = {
      id: "catABC",
      cards: [], // => category
      cleanTitle: "Category Title",
      icon: "folder-outline", // Ensure there's an icon so it's not "empty"
    };

    const { getByTestId } = renderEditModal();

    // Change the title => enabling the save
    await act(async () => {
      fireEvent.changeText(
        getByTestId("edit-modal-title-input"),
        "Updated Category Title"
      );
    });

    // Press save
    await act(async () => {
      fireEvent.press(getByTestId("edit-modal-save-button"));
    });

    expect(mockEditCategoryValues).toHaveBeenCalledWith(
      expect.objectContaining({ id: "catABC" }),
      "Updated Category Title",
      expect.anything() // selectedImage => { icon: "folder-outline" }, or if you switched to a real image
    );

    // Modal closed
    expect(mockModalVisible.value).toBe(false);
    expect(mockSelectedItem.value).toBeNull();
  });

  it("calls loginAlert if user is not authenticated, keeps modal open", async () => {
    useUserContextSelector.mockReturnValue(false);

    mockModalVisible.value = true;
    mockSelectedItem.value = {
      id: "card999",
      cleanTitle: "Anon Card",
      image: "http://example.com/image.png",
    };

    // Must change something or the save won't even attempt
    useDataContextSelector.mockReturnValue({
      categories: [],
      cachedImages: {
        card999: "http://example.com/image.png",
      },
    });

    const { getByTestId } = renderEditModal();

    await act(async () => {
      fireEvent.changeText(
        getByTestId("edit-modal-title-input"),
        "Edited Title"
      );
    });

    // Press save
    await act(async () => {
      fireEvent.press(getByTestId("edit-modal-save-button"));
    });

    expect(mockLoginAlert).toHaveBeenCalled();
    expect(mockEditCardValues).not.toHaveBeenCalled();
    expect(mockEditCategoryValues).not.toHaveBeenCalled();

    // Modal remains open
    expect(mockModalVisible.value).toBe(true);
  });
});
