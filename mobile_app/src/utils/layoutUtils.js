/**
 * Calculates the grid layout for cards based on:
 * - containerWidth: actual measured width of the parent
 * - maxItemWidth: "ideal" or "maximum" card width (100, 150, etc.)
 * - minColumns: minimum number of columns to render (2)
 * - baseHeightRatio: makes card’s height a certain ratio to its width.
 * - verticalSpacing: doesn't need to worry about spacing calculation
 *
 * Returns:
 * {
 *   numColumns: number,
 *   itemWidth: number,
 *   itemHeight: number,
 *   horizontalSpacing: number,
 *   verticalSpacing: number,
 * }
 */
export function calculateGridLayout({
  containerWidth,
  maxItemWidth,
  minColumns,
  baseHeightRatio = 1, //optional if card height = width
  minSpacing = 8, //minimal spacing between columns
  verticalSpacing = 12,
}) {
  //console.log("----- calculateGridLayout called -----");
  //console.log("containerWidth:", containerWidth);

  if (containerWidth <= 0) {
    //console.log("containerWidth <= 0 => fallback 1 col, 0 spacing");
    return {
      numColumns: 1,
      itemWidth: maxItemWidth,
      itemHeight: maxItemWidth,
      horizontalSpacing: 0,
      verticalSpacing,
    };
  }

  //see how many columns we can fit if each item is `maxItemWidth`.
  let possibleCols = Math.floor(containerWidth / maxItemWidth);
  //console.log(
  //  "initial possibleCols:",
  //  possibleCols,
  //  "with maxItemWidth=",
  //  maxItemWidth
  //);

  //if we cant fit minColumns => force minColumns and shrink itemWidth
  if (possibleCols < minColumns) {
    //force at least minColumns by shrinking itemWidth:
    const itemWidth = containerWidth / minColumns;
    //console.log(
    //  `can't fit ${minColumns} columns at maxItemWidth, so shrink itemWidth to`,
    //  itemWidth
    //);
    //if we want a small spacing between them, need to factor it out of containerWidth
    //something like: containerWidth - ( (minColumns+1) * minSpacing ) / minColumns
    //but to keep it simple for now:
    return {
      numColumns: minColumns,
      itemWidth,
      itemHeight: itemWidth * baseHeightRatio,
      horizontalSpacing: minSpacing,
      verticalSpacing,
    };
  }

  //if leftover space is negative, reduce columns
  while (possibleCols > 0 && possibleCols * maxItemWidth > containerWidth) {
    possibleCols--;
  }
  //console.log("after leftover check, possibleCols:", possibleCols);

  if (possibleCols < minColumns) {
    const itemWidth = containerWidth / minColumns;
    //console.log(
    //  "leftover < 0 => forced back to minColumns, itemWidth=",
    //  itemWidth
    //);
    return {
      numColumns: minColumns,
      itemWidth,
      itemHeight: itemWidth * baseHeightRatio,
      horizontalSpacing: minSpacing,
      verticalSpacing,
    };
  }

  //we can fit "possibleCols" columns at the maxItemWidth, figure out leftover space
  //and turn that leftover into spacing between columns.
  //now leftover >= 0
  //console.log("leftover space:", leftover);
  const gapsCount = possibleCols + 1;
  let itemWidth = maxItemWidth;
  let leftover = containerWidth - possibleCols * itemWidth;

  let horizontalSpacing = leftover / gapsCount;

  //clamp horizontal spacing at a minimum
  if (horizontalSpacing < minSpacing) {
    //console.log(
    //  `horizontalSpacing < minSpacing: ${horizontalSpacing} < ${minSpacing}, so clamp to minSpacing`
    //);
    horizontalSpacing = minSpacing;

    const totalSpacing = horizontalSpacing * gapsCount;
    //shrink itemWidth so total width fits, otherwise width could end up being bigger then container width
    itemWidth = (containerWidth - totalSpacing) / possibleCols;
  }

  //const itemWidth = maxItemWidth; //not shrinking the item if leftover >= 0

  //console.log("FINAL => numColumns:", possibleCols);
  //console.log("itemWidth:", itemWidth);
  //console.log("horizontalSpacing:", horizontalSpacing);
  //console.log("---------------------------------------");

  return {
    numColumns: possibleCols,
    itemWidth,
    itemHeight: itemWidth * baseHeightRatio,
    horizontalSpacing,
    verticalSpacing,
  };
}
