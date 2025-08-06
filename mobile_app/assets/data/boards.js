const boards = [
  {
    "title": "My Custom Cards",
    "name": "face-man-shimmer-outline"
  },
  {
    "title": "Alphabet",
    "name": "format-letter-case"
  },
  {
    "title": "Descriptive Position",
    "name": "axis-arrow"
  },
  {
    "title": "Descriptive State",
    "name": "creation"
  },
  {
    "title": "Healthcare Medical conditions",
    "name": "hospital-box"
  },
  {
    "title": "Plants and Trees",
    "name": "tree"
  },
  {
    "title": "Descriptive Direction",
    "name": "compass-outline"
  },
  {
    "title": "Leisure Toys",
    "name": "puzzle-outline"
  },
  {
    "title": "Number Activity",
    "name": "numeric"
  },
  {
    "title": "Religion Festival",
    "name": "calendar-star"
  },
  {
    "title": "Religion General",
    "name": "church"
  },
  {
    "title": "Electrical TV",
    "name": "television-classic"
  },
  {
    "title": "Sport",
    "name": "soccer"
  },
  {
    "title": "Transport Air",
    "name": "airplane"
  },
  {
    "title": "People Feelings",
    "name": "emoticon-happy-outline"
  },
  {
    "title": "Descriptive Time",
    "name": "clock-outline"
  },
  {
    "title": "Healthcare Grooming items",
    "name": "shower-head"
  },
  {
    "title": "People Profession",
    "name": "account-tie"
  },
  {
    "title": "Healthcare Body parts",
    "name": "human-handsup"
  },
  {
    "title": "Food Nuts",
    "name": "peanut-off-outline"
  },
  {
    "title": "Transport Road",
    "name": "road-variant"
  },
  {
    "title": "Religion Person",
    "name": "account-outline"
  },
  {
    "title": "Animal Spiders and Insects",
    "name": "spider-thread"
  },
  {
    "title": "Animal Mammal",
    "name": "cow"
  },
  {
    "title": "Food Fruit",
    "name": "fruit-cherries"
  },
  {
    "title": "Drink Type",
    "name": "glass-cocktail"
  },
  {
    "title": "Tools Workshop",
    "name": "toolbox-outline"
  },
  {
    "title": "Animal Habitat",
    "name": "paw"
  },
  {
    "title": "Work and School Stationery",
    "name": "pen"
  },
  {
    "title": "Sport Accessories",
    "name": "football-helmet"
  },
  {
    "title": "Building Furniture",
    "name": "sofa"
  },
  {
    "title": "Leisure Games",
    "name": "cards-outline"
  },
  {
    "title": "Military",
    "name": "tank"
  },
  {
    "title": "Computer Icon",
    "name": "laptop"
  },
  {
    "title": "Art Making",
    "name": "palette-outline"
  },
  {
    "title": "Work and School Timetable",
    "name": "calendar-clock"
  },
  {
    "title": "Building School",
    "name": "school"
  },
  {
    "title": "Food Vegetables and salads",
    "name": "food-apple-outline"
  },
  {
    "title": "Science",
    "name": "flask-outline"
  },
  {
    "title": "People Relationship",
    "name": "account-multiple-outline"
  },
  {
    "title": "Healthcare Medical items",
    "name": "medical-bag"
  },
  {
    "title": "People Descriptive",
    "name": "account-star-outline"
  },
  {
    "title": "Building Garden and farm",
    "name": "barn"
  },
  {
      "title": "Food Meat",
      "name": "food-steak"
  },
  {
      "title": "Food Breads and baking",
      "name": "bread-slice"
  },
  {
      "title": "Food Kitchen actions",
      "name": "chef-hat"
  },
  {
      "title": "Food Kitchen items",
      "name": "fridge"
  },
  {
      "title": "Celebration Item",
      "name": "balloon"
  },
  {
      "title": "Money",
      "name": "currency-usd"
  },
  {
      "title": "Food Meals and snacks",
      "name": "food"
  },
  {
      "title": "Science Eco",
      "name": "leaf"
  },
  {
      "title": "Building Contents",
      "name": "sofa"
  },
  {
      "title": "Animal Activity Grooming",
      "name": "dog-service"
  },
  {
      "title": "Healthcare Grooming activities",
      "name": "shower"
  },
  {
      "title": "Electrical General",
      "name": "power-plug"
  },
  {
      "title": "Holiday and travel",
      "name": "beach"
  },
  {
      "title": "Clothes Accessories",
      "name": "hat-fedora"
  },
  {
      "title": "Animal Features",
      "name": "paw"
  },
  {
      "title": "Clothes General",
      "name": "tshirt-crew"
  },
  {
      "title": "Communication Aid",
      "name": "cellphone"
  },
  {
      "title": "Animal Birds",
      "name": "duck"
  },
  {
      "title": "Animal Activity Feeding",
      "name": "bowl"
  },
  {
      "title": "Art Colour",
      "name": "palette"
  },
  {
      "title": "Building Equipment and devices",
      "name": "tools"
  },
  {
      "title": "Transport Water",
      "name": "ferry"
  },
  {
      "title": "Celebration Event",
      "name": "firework"
  },
  {
      "title": "Descriptive Quantity",
      "name": "calculator"
  },
  {
      "title": "Clothes Jewellery",
      "name": "diamond-stone"
  },
  {
      "title": "Food Sweets and desserts",
      "name": "cupcake"
  },
  {
      "title": "Descriptive Shape",
      "name": "rhombus-split"
  },
  {
      "title": "Food Dairy",
      "name": "cow"
  },
  {
      "title": "Food Feeding and eating",
      "name": "silverware-fork-knife"
  },
  {
      "title": "Electrical Media",
      "name": "television-classic"
  },
  {
      "title": "Food Diet",
      "name": "food-apple"
  },
  {
      "title": "Drink Containers and measures",
      "name": "glass-mug-variant"
  },
  {
      "title": "Building Public",
      "name": "city"
  },
  {
      "title": "Food Ingredients",
      "name": "barley"
  },
  {
      "title": "Building Structure",
      "name": "office-building"
  },
  {
      "title": "Work and School Education",
      "name": "school"
  },
  {
      "title": "Animal Reptiles and Amphibians",
      "name": "turtle"
  },
  {
      "title": "Electrical Phone",
      "name": "cellphone"
  },
  {
      "title": "Food Poultry",
      "name": "food-turkey"
  },
  {
      "title": "Leisure General",
      "name": "beach"
  },
  {
      "title": "Building Household tasks",
      "name": "broom"
  },
  {
      "title": "Building Shop",
      "name": "store"
  },
  {
      "title": "Environment Weather",
      "name": "weather-lightning"
  },
  {
      "title": "Science Astronomy",
      "name": "telescope"
  },
  {
      "title": "Electrical Computer",
      "name": "laptop"
  },
  {
      "title": "Country Maps",
      "name": "map"
  },
  {
      "title": "Animal Crustacean and Molluscs",
      "name": "snail"
  },
  {
      "title": "Clothes Sport",
      "name": "tshirt-crew"
  },
  {
      "title": "Music Instrument",
      "name": "guitar-acoustic"
  },
  {
      "title": "Communication Signs",
      "name": "chat-processing"
  },
  {
      "title": "Animal Fish and Marine mammals",
      "name": "dolphin"
  },
  {
      "title": "Work and School Subjects",
      "name": "school"
  },
  {
      "title": "Drink Actions",
      "name": "cup-water"
  },
  {
      "title": "Drink Description",
      "name": "glass-mug-variant"
  },
  {
      "title": "Animal Other Invertebrates",
      "name": "bug"
  },
  {
      "title": "Food Eggs",
      "name": "egg-easter"
  },
  {
      "title": "Number",
      "name": "numeric"
  },
  {
      "title": "People Actions",
      "name": "human-greeting"
  },
  {
      "title": "Country Flags",
      "name": "flag"
  },
  {
      "title": "Building Residential",
      "name": "home"
  },
  {
      "title": "Tools Garden",
      "name": "flower-tulip"
  },
  {
      "title": "Verb",
      "name": "run-fast"
  },
  {
      "title": "Communication Conversation",
      "name": "message-text"
  },
  {
      "title": "Politics",
      "name": "vote"
  },
  {
      "title": "Question",
      "name": "help-circle"
  },
  {
      "title": "Leisure Playground",
      "name": "slide"
  },
  {
      "title": "Food Pastas and rice",
      "name": "rice"
  },
  {
      "title": "Building Office and factory",
      "name": "office-building"
  },
  {
      "title": "Transport Space",
      "name": "rocket"
  },
  {
      "title": "Food Vegetables and salad",
      "name": "food-apple"
  },
  {
      "title": "Food Fish and seafood",
      "name": "fish"
  },
  {
      "title": "Food Festival",
      "name": "cake-variant"
  },
  {
      "title": "Transport Rail",
      "name": "train"
  },
  {
      "title": "Animal Activity Misc",
      "name": "paw"
  },
  {
      "title": "Tools Actions",
      "name": "toolbox"
  }
];

export default boards;
