const addEmptyItems = (list, title, numColumns) => {
  const newList = [...list];

  let emptySpacesEnd = 0;
  if (newList.length % numColumns > 0) {
    emptySpacesEnd =
      (Math.floor(newList.length / numColumns) + 1) * numColumns -
      newList.length;
  } else {
    emptySpacesEnd =
      Math.floor(newList.length / numColumns) * numColumns - newList.length;
  }
  while (emptySpacesEnd > 0) {
    newList.push({
      id: `end-${title}-${emptySpacesEnd}`,
      title: `end-${title}-${emptySpacesEnd}`,
      isEmpty: true,
    });
    emptySpacesEnd = emptySpacesEnd - 1;
  }
  return newList;
};

export default addEmptyItems;
