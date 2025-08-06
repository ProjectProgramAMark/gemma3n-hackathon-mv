import { useEffect, useState } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import AsyncStorage from "@react-native-async-storage/async-storage";
import mulberry_cards from "../../assets/data/mulberry_cards";
import popularTitles from "../../assets/data/popular_cards";
import boards from "../../assets/data/boards";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [cards, setCards] = useState({});
  const [categories, setCategories] = useState({});
  const [homeCategory, setHomeCategory] = useState({});
  const [loading, setLoading] = useState(true); // tracks data loading

  const defaultCardsKey = "defaultCards";
  const defaultCategoriesKey = "defaultCategories";

  const initializeDefaultData = async () => {
    try {
      await AsyncStorage.clear();
      console.log("initializeDefaultData called.");

      //check if default cards and categories were already built and cached
      const cachedDefaultCards = await AsyncStorage.getItem(defaultCardsKey);
      const cachedDefaultCategories = await AsyncStorage.getItem(
        defaultCategoriesKey
      );

      if (cachedDefaultCards && cachedDefaultCategories) {
        console.log("Found cached default data. Parsing...");
        setCards(JSON.parse(cachedDefaultCards));
        setCategories(JSON.parse(cachedDefaultCategories));
        return; // done
      }

      //if no cached data, build it
      console.log(
        "No cached default data found. Building from mulberry_cards..."
      );

      if (!mulberry_cards || !Array.isArray(mulberry_cards)) {
        console.log("mulberry_cards is empty or not an array!");
        return;
      }

      const mulberryData = mulberry_cards.reduce((acc, item) => {
        let modifiedTitle = item.title.replace(/(.*),_to$/, "to $1");
        modifiedTitle = modifiedTitle.replace(
          /^(favorite_|recent_)?(.+?)(_?\d+[a-zA-Z]*)?$/,
          "$2"
        );
        modifiedTitle = modifiedTitle.replace(/_/g, " ");
        acc[item.title] = {
          ...item,
          id: item.title,
          cleanTitle: modifiedTitle,
          categories: [...item.categories],
        };
        //if card is "popular", push it into the "home_page" category
        if (popularTitles.includes(item.title)) {
          acc[item.title].categories.push("home_page");
        }
        return acc;
      }, {});

      //build category dict from build mulberyData
      const mulberryCategoryDict = {};
      Object.values(mulberryData).forEach((card) => {
        card.categories.forEach((categoryTitle) => {
          if (!mulberryCategoryDict[categoryTitle]) {
            mulberryCategoryDict[categoryTitle] = {
              id: categoryTitle,
              title: categoryTitle,
              favorite: false,
              cleanTitle: categoryTitle,
              cards: [],
            };
          }
          mulberryCategoryDict[categoryTitle].cards.push(card.id);
        });
      });

      //build "home_page"
      const homeCategory = {
        id: "home_page",
        //title: "8cf04a9734132302f96da8e113e80ce5",
        title: "Home",
        cleanTitle: "Home",
        favorite: false,
        icon: "home",
        cards: [...popularTitles],
      };
      mulberryCategoryDict[homeCategory.id] = homeCategory;

      //add boards icons
      boards.forEach((category) => {
        if (category.title in mulberryCategoryDict) {
          mulberryCategoryDict[category.title].icon = category.name;
        }
      });

      await AsyncStorage.setItem(defaultCardsKey, JSON.stringify(mulberryData));
      await AsyncStorage.setItem(
        defaultCategoriesKey,
        JSON.stringify(mulberryCategoryDict)
      );

      console.log("Default data built and cached. Setting state...");
      setCards(mulberryData);
      setCategories(mulberryCategoryDict);
      setHomeCategory(homeCategory);
    } catch (error) {
      console.error("Error initializing defaultData:", error);
    }
  };

  //decides what to do at startup
  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      try {
        // unauthorized user – build default data
        await initializeDefaultData();
      } catch (err) {
        console.error("initializing default data error", err);
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  return (
    <DataContext.Provider
      value={{
        cards,
        categories,
        homeCategory,
        loading,
        setCards,
        setCategories,
        setLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContextSelector = (selector) =>
  useContextSelector(DataContext, selector);
