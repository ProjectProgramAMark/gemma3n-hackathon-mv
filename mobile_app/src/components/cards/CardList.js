import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { FlatList, View, Text, Dimensions } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSettings } from "../../contexts/SettingsContext";
import { lightStyles, darkStyles } from "../../styles/AppStyles";
import { calculateGridLayout } from "../../utils/layoutUtils";
import Card from "./Card";
import addEmptyItems from "../../utils/addEmptyItems";
import { usePredictions } from "../../contexts/PredictionContext";
import PredictionBar from "./PredictionBar";

const CardList = ({
  data,
  page,
  maxCardWidth = 160,
  minColumns = 2,
  cardAspectRatio = 1,
}) => {
  const { isDarkMode } = useSettings();
  const stylesDefault = isDarkMode ? darkStyles : lightStyles;

  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get("window").width
  );

  /* ── prediction-bar helpers ───────────────────────── */
  const {
    suggestions,
    hideBar,
    anchorRect,
    setContainerOffset, // for card.measure offset
    setItemMetrics, // for card sizing
  } = usePredictions();

  /* scroll / layout refs */
  const containerRef = useRef(null);

  /* grid calculation */
  const layout = useMemo(
    () =>
      calculateGridLayout({
        containerWidth,
        maxItemWidth: maxCardWidth,
        minColumns,
        baseHeightRatio: cardAspectRatio,
        minSpacing: 8,
        verticalSpacing: 12,
      }),
    [containerWidth, maxCardWidth, minColumns, cardAspectRatio]
  );

  /* expose item metrics to PredictionContext */
  useEffect(() => {
    setItemMetrics({
      width: layout.itemWidth,
      height: layout.itemHeight,
      spacing: layout.horizontalSpacing,
    });
  }, [layout]);

  /* final list data */
  const finalData = useMemo(() => {
    return addEmptyItems(data ?? [], page, layout.numColumns);
  }, [data, page, layout.numColumns]);

  const rowHeight = layout.itemHeight + layout.verticalSpacing;

  const getItemLayout = useCallback(
    (_d, i) => ({ length: rowHeight, offset: rowHeight * i, index: i }),
    [rowHeight]
  );

  /* outer container resize – now also sets containerOffset */
  const onContainerLayout = useCallback(
    (e) => {
      const w = e.nativeEvent.layout.width;
      e.target.measureInWindow((_x, y) => setContainerOffset(y));
      if (Math.round(w) !== Math.round(containerWidth)) setContainerWidth(w);
    },
    [containerWidth]
  );

  /* render helpers */
  const renderEmptyList = useCallback(
    () => (
      <View style={stylesDefault.noResultsFoundContainer}>
        <Text style={stylesDefault.noResultsFoundText}>No results found</Text>
        <AntDesign
          name="meh"
          size={40}
          style={stylesDefault.noResultsFoundIcon}
        />
      </View>
    ),
    [stylesDefault]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const containerStyle = {
        width: layout.itemWidth,
        height: layout.itemHeight,
        marginBottom: layout.verticalSpacing,
        marginLeft:
          index % layout.numColumns === 0 ? 0 : layout.horizontalSpacing,
        justifyContent: "center",
        alignItems: "center",
      };

      if (item.isTitle)
        return (
          <View style={[containerStyle, stylesDefault.titleItemContainer]}>
            <Text
              style={stylesDefault.cardGroupTitle}
              numberOfLines={2}
              adjustsFontSizeToFit
              allowFontScaling
            >
              {item.title}
            </Text>
          </View>
        );

      if (item.isEmpty)
        return (
          <View style={[containerStyle, stylesDefault.emptyItemContainer]} />
        );

      return (
        <View style={[containerStyle, stylesDefault.cardItemContainer]}>
          <Card card={item} page={page} containerRef={containerRef} />
        </View>
      );
    },
    [layout, page, stylesDefault]
  );

  const listKey = `${layout.numColumns}-${Math.round(
    layout.horizontalSpacing * 10
  )}-${finalData.length}`;

  /* ─────────── render ─────────── */
  return (
    <View ref={containerRef} style={{ flex: 1 }} onLayout={onContainerLayout}>
      <FlatList
        key={listKey}
        data={finalData}
        keyExtractor={(item) => item?.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        numColumns={layout.numColumns}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: 5,
          paddingHorizontal: layout.horizontalSpacing,
          paddingBottom: 200,
        }}
        bounces={false}
        alwaysBounceVertical={false}
        removeClippedSubviews={false}
        getItemLayout={getItemLayout}
      />

      {/* prediction bar */}
      <PredictionBar
        visible={suggestions.length > 0}
        data={suggestions}
        onClose={hideBar}
        anchor={anchorRect}
      />
    </View>
  );
};

export default CardList;
