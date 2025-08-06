import { useState, useEffect, useMemo } from "react";
import { Dimensions } from "react-native";

function useListLayout(targetCardWidth, minMargin) {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );

  // Memoize numColumns and marginSize calculations
  const { numColumns, marginSize } = useMemo(() => {
    const numColumns = Math.floor(screenWidth / targetCardWidth);
    const totalCardsWidth = numColumns * targetCardWidth;
    const totalMarginSpace = screenWidth - totalCardsWidth;
    const marginSize = Math.max(
      Math.round(totalMarginSpace / (numColumns + 1) / 2),
      minMargin
    );

    return { numColumns, marginSize };
  }, [screenWidth, targetCardWidth, minMargin]);

  useEffect(() => {
    const handleChange = ({ window }) => {
      setScreenWidth(window.width);
    };
    const subscription = Dimensions.addEventListener("change", handleChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return { numColumns, marginSize };
}

export default useListLayout;
