/**
 * "Meet the Warm Heart" — culture and storytelling.
 *
 * Malawi's reputation problem is that it gets described in terms of what it is
 * not: not Kenya, not Tanzania, not Rwanda. This section exists to argue the
 * opposite, and it is the part of the site most likely to be what somebody
 * remembers in a year.
 *
 * Keep it concrete. Every entry names a place, a practice, or a thing you can
 * eat — not an abstraction.
 */

export type CultureStory = {
  id: string;
  topic: "Food" | "People" | "Culture" | "Music" | "Stories" | "Markets" | "Traditions" | "Communities";
  title: string;
  body: string;
  photo: string;
  /** Where this happens, so the story links to somewhere bookable. */
  destinationIds: string[];
};

export const cultureStories: CultureStory[] = [
  {
    id: "nsima",
    topic: "Food",
    title: "Everything begins with maize",
    body:
      "Nsima is a stiff porridge made from maize flour and water and nothing else, and in Malawi it is not a side dish — it is the plate. You eat it with a relish called nkwizi, and the relish is where the meal actually is. Chama beans, ndolo (pigeon peas), kapenta (dried fish), beef stew, greens cooked down with the last of the tomato. A Malawian plate is a mound of nsima with one or two things on the side, and it is the most reliable thing you will eat in the country. The bowl you eat it from, called a nthiri, is never washed between servings.",
    photo: "malawian-food-nsima",
    destinationIds: ["blantyre", "lilongwe", "nkhata-bay"],
  },
  {
    id: "chambo",
    topic: "Food",
    title: "A lake of 700 million fish",
    body:
      "Lake Malawi holds more fish species than any other lake on Earth, and the great majority of them exist nowhere else. Chambo, the small silver cichlid that fills the lake in enormous numbers, is eaten daily in a dozen forms — fried, grilled, dried, smoked. If you have never eaten freshwater fish that a man caught himself an hour ago, this is the place to find out what that is like.",
    photo: "fishing-chambo",
    destinationIds: ["mangochi", "monkey-bay", "nkhata-bay", "cape-maclear"],
  },
  {
    id: "greetings",
    topic: "People",
    title: "How you greet someone matters more than you think",
    body:
      "Malawi is a greeting culture, and the greeting is the actual interaction. Handshakes are common among men; among women a handshake and light hand-clasp, or a brief clasp of the hands, is normal. Asking after someone's family is not small talk — it is the point of the conversation, and skipping it registers as rude. Learn the Chichewa greeting, 'Moyo bwanji', or 'Zikomo', and you will be immediately treated as someone who tried.",
    photo: "village-children",
    destinationIds: ["blantyre", "nkhata-bay", "ntchisi", "dedza"],
  },
  {
    id: "gule-wamkulu",
    topic: "Traditions",
    title: "A dance that is a rite, not a show",
    body:
      "Gule Wamkulu is performed by Chewa communities at initiation, weddings, funerals and church festivals. Costumed dancers represent animals, spirits and characters out of Malawian folklore, and the performance moves between comedy, satire and something genuinely unsettling. It is sacred in origin, which means the way to see it is to be invited to something rather than to go looking. If you find yourself at a village celebration, go. Do not photograph without asking.",
    photo: "traditional-dance",
    destinationIds: ["mangochi", "ntchisi", "dedza", "mua-mission"],
  },
  {
    id: "drums",
    topic: "Music",
    title: "The drum is the conversation",
    body:
      "Malawian music runs through the Chichewa and Tonga traditions and out into gospel, which has a genuinely enormous following here. Live venues in Blantyre and Lilongwe run traditional ensembles, modern Afrobeat crossover and church gospel in the same week. What unifies it is percussion — the drumming carries the conversation, and the dancers answer it. Mandala House in Blantyre is where you will find it in a room rather than a recording.",
    photo: "drums-and-dance",
    destinationIds: ["blantyre", "lilongwe"],
  },
  {
    id: "mua",
    topic: "Stories",
    title: "The museum that explains itself",
    body:
      "The museum at Mua Mission holds the largest collection of Malawian and Zambian ethnographic material in the region — masks, carvings, musical instruments and domestic objects from Chewa, Yao, Ngoni and Lhomwe communities. It is unusual because it sits inside a working mission station with an active carving school next door, so the collection is about living practice rather than a preserved past. The carvers' work can be bought directly from them, which is the only way it should be bought.",
    photo: "craft-woodcarving",
    destinationIds: ["mua-mission", "dedza"],
  },
  {
    id: "market",
    topic: "Markets",
    title: "The market is the real capital",
    body:
      "Malawi's commercial life happens in its markets, and they are open and enormous. Lilongwe's Old Town is the biggest single market in the country; Zomba and Mzuzu are more local in character. Go before seven if you want to see a market trading rather than packing up. Salt fish from the lake, dried kapenta, tomatoes, enormous bundles of greens, and further in, craft and fabric. Everything on this site came from a market somewhere.",
    photo: "market-lilongwe",
    destinationIds: ["lilongwe", "zomba-plateau", "nkhata-bay", "salima"],
  },
  {
    id: "baobabs",
    topic: "Communities",
    title: "The tree that stores water for the village",
    body:
      "Northern Malawi is baobab country, with trees of enormous girth standing alone in the fields around Nsanje and Karonga. Malawians use the fruit in a sour porridge called mponda, the seeds in sauces and stews, and the bark in medicine. The trees are also fed by communities that protect them. Travelling the northern road in the dry season and stopping at one of these is a different Malawi entirely from the lake country.",
    photo: "baobab",
    destinationIds: ["livingstonia", "viphya", "nyika-national-park"],
  },
  {
    id: "tuk-tuk",
    topic: "People",
    title: "A city seen from the back of a tuk-tuk",
    body:
      "Tuk-tuks are the standard short-distance transport in Malawian cities and riding one is the honest way to see them. You get the whole street at eye level, you get moved through traffic that a car cannot enter, and it costs almost nothing. In Lilongwe and Blantyre the routes are fixed and the drivers know them. Agree the fare before you get in, and hold on.",
    photo: "tuk-tuk",
    destinationIds: ["lilongwe", "blantyre", "nkhata-bay"],
  },
  {
    id: "beekeepers",
    topic: "Communities",
    title: "The co-operative doing the unglamorous work",
    body:
      "Beekeeping co-operatives run in the highland areas around Dedza and Ntchisi, keeping hives in miombo woodland. Malawi's honey is largely wild-harvested from that woodland and is well regarded well beyond its borders. Visiting a co-operative is a couple of hours of genuinely interesting work rather than a staged demonstration, and buying direct from the co-operative is both the fair price and the point of going.",
    photo: "honey-beekeepers",
    destinationIds: ["dedza", "ntchisi", "lenje-estate"],
  },
  {
    id: "fisherfolk",
    topic: "Communities",
    title: "The boats come in before dawn",
    body:
      "Most Malawian lake towns wake before sunrise because the fishing boats come in then. At Monkey Bay, Mangochi and Nkhata Bay the fishing fleet returns in the dark and the market is being set up as it arrives. The catch is auctioned at first light, much of it bought the same morning. It is the clearest possible demonstration that this lake is a working economy, not a backdrop.",
    photo: "fisherfolk-lake",
    destinationIds: ["monkey-bay", "mangochi", "nkhata-bay"],
  },
  {
    id: "malangalanga-people",
    topic: "People",
    title: "A village that stands on stilts",
    body:
      "Malangalanga is a fishing village built on stilts in the Senga Bay reed beds, about forty-five minutes by boat from Salima. Houses, a school, a church and a football pitch, all above water in reeds that run to the horizon. Nothing about it is staged — reed-cutting and fishing are how it has always worked — and the community runs its own tourism operation so that visitors can see how it lives without turning it into a set.",
    photo: "kumbali-island",
    destinationIds: ["malangalanga", "salima"],
  },
];

export const cultureTopics = [
  "Food",
  "People",
  "Culture",
  "Music",
  "Stories",
  "Markets",
  "Traditions",
  "Communities",
] as const;