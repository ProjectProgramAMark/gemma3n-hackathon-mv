import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useContextSelector } from "use-context-selector";
import { getNextCards } from "../utils/aacPredictor"; // on-device LLM helper
import { useDataContextSelector } from "./DataContext";
import { CardContext } from "./CardContext";
//import popularTitles from "../../assets/data/popular_cards";

const MAX_ALLOWED = 100; // TODO: update

const PredictionContext = createContext();
export const usePredictions = () => useContext(PredictionContext);

/**
 * Provider keeps: TODO: fix allowed cards implementation
 *   • historyRef -> last 3 chosen card IDs
 *   • suggestions -> [{cardObj}, ... ] rendered by <PredictionBar>
 *   • anchorRect -> geometry of the tapped card (for bar placement)
 *   • itemMetrics -> size/spacing info fed in by CardList
 */
export const PredictionProvider = ({ children }) => {
  const historyRef = useRef([]);
  const [suggestions, setSuggestions] = useState([]);
  const [anchorRect, setAnchorRect] = useState(null);
  const [containerOffsetY, setContainerOffset] = useState(0);
  const [itemMetrics, setItemMetrics] = useState({
    width: 0,
    height: 0,
    spacing: 0,
  });

  const cardsDict = useDataContextSelector((c) => c.cards);
  const categoriesDict = useDataContextSelector((c) => c.categories);
  const homeCategory = useDataContextSelector((c) => c.homeCategory);

  const selectedCards = useContextSelector(CardContext, (c) => c.selectedCards);

  const allowedQueueRef = useRef([]); // FIFO order
  const lastPredictedIdsRef = useRef([]);

  function pushIntoAllowedQueue(newCards) {
    const seen = new Set(allowedQueueRef.current.map((c) => c.id));
    const merged = [...allowedQueueRef.current];

    newCards.forEach((c) => {
      if (!seen.has(c.id)) {
        merged.push(c); // add to END
        seen.add(c.id);
      }
    });

    // keep the MOST‑recent 100
    const start = Math.max(0, merged.length - MAX_ALLOWED);
    allowedQueueRef.current = merged.slice(start);
  }

  const cardsFromCategories = (card) => {
    const out = [];
    (card.categories || [])
      .filter((id) => id !== "home_page")
      .forEach((catId) => {
        const cat = categoriesDict[catId];
        if (!cat) return;
        (cat.cards || []).forEach((cardId) => {
          const c = cardsDict[cardId];
          if (c)
            out.push({
              id: c.id,
              title: c.cleanTitle,
              cleanTitle: c.cleanTitle,
            });
        });
      });
    return out;
  };

  /** Return a *deduplicated* array of card objects that share at least one
    category with any of the currently–selected cards. */
  const buildAllowedFromCategories = (cardJustTapped) => {
    // 1. categories mentioned so far  ─────────────────────────────
    const catIds = new Set(); //<string>();

    Object.keys(selectedCards).forEach((id) => {
      if (!selectedCards[id].isSelected) return;
      cardsDict[id]?.categories?.forEach((cid) => catIds.add(cid));
    });
    // include the category(ies) of the card just tapped
    cardJustTapped.categories?.forEach((cid) => catIds.add(cid));

    // 2. all cards inside those categories  ────────────────────────
    const allowed = new Map(); //<string, CardObj>();   // id ➞ card (keeps unique)

    catIds.forEach((cid) => {
      categoriesDict[cid]?.cards?.forEach((cardId) => {
        const c = cardsDict[cardId];
        if (c) allowed.set(c.id, c);
      });
    });

    return Array.from(allowed.values());
  };

  /* Call **before** pushing the chosen card into history. */
  const chooseCard = async (card, cardRect = null) => {
    /* cancel previous job */
    const thisRun = Symbol("predict"); // unique token
    chooseCard.latestRun = thisRun;

    /* Build “allowed” list */
    const prevHistory = historyRef.current;

    const newCats = cardsFromCategories(card);
    pushIntoAllowedQueue(newCats);

    const allowedCards = allowedQueueRef.current.filter(
      (c) =>
        c.id !== card.id && // don’t suggest the one just tapped
        !prevHistory.includes(c.id) && // don’t repeat immediate history
        !lastPredictedIdsRef.current.includes(c.id) // exclude last 5 suggestions
    );

    const allowedObjs = allowedCards.map(({ id, cleanTitle }) => ({
      id,
      title: cleanTitle,
    }));

    /* Ask the on-device LLM for up to 5 IDs */
    let ids = [];
    try {
      ids = await getNextCards(prevHistory, allowedObjs); // exactly 5 IDs
      console.log("[Prediction] LLM reply:", ids);
      lastPredictedIdsRef.current = ids;
      if (chooseCard.latestRun !== thisRun) return; // late reply – ignore
    } catch (err) {
      console.warn("[Prediction] LLM failed – fallback to random", err);
    }

    /* Map to card objects & pad to exactly 5 unique suggestions */
    const pool = Object.values(cardsDict).filter(
      (c) => c.id !== card.id && !prevHistory.includes(c.id)
    );
    let mapped = ids.map((id) => cardsDict[id]).filter(Boolean);

    while (mapped.length < 5 && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      const cand = pool.splice(i, 1)[0];
      if (cand && !mapped.some((c) => c.id === cand.id)) mapped.push(cand);
    }
    //mapped = mapped.slice(0, 5); // enforce length 5

    /* Expose to UI & remember geometry for bar placement */
    setSuggestions(mapped);
    if (cardRect) setAnchorRect(cardRect);

    /* Finally update history (keep last 3) */
    historyRef.current = [...prevHistory, card.id].slice(-3);
  };

  const hideBar = () => setSuggestions([]);

  /*  Reset caches when no cards are selected  */
  useEffect(() => {
    const anythingSelected = Object.values(selectedCards).some(
      (c) => c.isSelected
    );
    if (!anythingSelected) {
      lastPredictedIdsRef.current = [];
      allowedQueueRef.current = [];
      historyRef.current = [];
      setSuggestions([]);
      setAnchorRect(null);
    }
  }, [selectedCards]);

  return (
    <PredictionContext.Provider
      value={{
        suggestions,
        chooseCard,
        hideBar,
        anchorRect,
        setContainerOffset,
        setItemMetrics,
        itemMetrics,
        containerOffsetY,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};
