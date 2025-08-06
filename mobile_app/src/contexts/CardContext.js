import React, { useState, useCallback } from "react";
import { createContext } from "use-context-selector";

export const CardContext = createContext();

export const CardContextProvider = ({ children }) => {
  const [selectedCards, setSelectedCards] = useState({});

  const handleSelection = useCallback((id, cleanTitle) => {
    let isCurrentlySelected = false;
    setSelectedCards((currentSelectedCards) => {
      isCurrentlySelected = !currentSelectedCards[id]?.isSelected || false;
      return {
        ...currentSelectedCards,
        [id]: {
          isSelected: isCurrentlySelected,
          cleanTitle: cleanTitle,
        },
      };
    });
    return isCurrentlySelected;
  }, []);

  const clearSelected = useCallback(() => {
    setSelectedCards({});
  }, []);

  return (
    <CardContext.Provider
      value={{
        selectedCards,
        handleSelection,
        clearSelected,
      }}
    >
      {children}
    </CardContext.Provider>
  );
};
