import addEmptyItems from "./addEmptyItems";

//adds empty items and titles where necessary depending on the section title
const createListData = (dataList, sectionTitle, numColumns) => {
  let list = [];
  if (sectionTitle === "Categories:" || sectionTitle === "Home:") {
    list.push({
      title: sectionTitle,
      isTitle: true,
      id: `title_${sectionTitle}`,
    });
    let emptySpacesTitle = numColumns - 1;
    while (emptySpacesTitle > 0) {
      list.push({
        id: `${sectionTitle}-${emptySpacesTitle}`,
        title: `${sectionTitle}-${emptySpacesTitle}`,
        isEmpty: true,
      });
      emptySpacesTitle--;
    }
    list.push(...dataList);
    list = addEmptyItems(list, sectionTitle, numColumns);
  } else if (sectionTitle === "category") {
    list.push(...dataList);
    list = addEmptyItems(list, sectionTitle, numColumns);
  } else {
    dataList.forEach((section) => {
      list.push({
        title: section.title,
        isTitle: true,
        id: `title_${section.title}`,
      });
      let emptySpacesTitle = numColumns - 1;
      while (emptySpacesTitle > 0) {
        list.push({
          id: `${section.title}-${emptySpacesTitle}`,
          title: `${section.title}-${emptySpacesTitle}`,
          isEmpty: true,
        });
        emptySpacesTitle--;
      }
      list.push(...section.cards);
      list = addEmptyItems(list, section.title, numColumns);
    });
  }
  return list;
};

export default createListData;
