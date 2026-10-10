/**
 * Practical ground-truth content for Malawi travel.
 *
 * This is the part of the site a competitor cannot generate with a language
 * model and a tourist cannot easily find on a forum: the boring specifics that
 * actually decide whether a trip works.
 *
 * IMPORTANT: these figures are editorial guidance written from general
 * knowledge of the region. Several are indicative rather than authoritative —
 * visa fees in particular change frequently. Verify against the Immigration
 * Department and the Immigration Advisory Group before publishing, and treat
 * anything money-related as a starting point for a traveller's own research.
 */

export type VisaCountry = {
  region: string;
  countries: string[];
  note: string;
};

export const visaRegions: VisaCountry[] = [
  {
    region: "Visa-free or visa on arrival",
    countries: [
      "Zambia",
      "Tanzania",
      "Kenya",
      "Uganda",
      "Rwanda",
      "Mozambique",
      "Botswana",
      "Zimbabwe",
      "South Africa",
      "Namibia",
      "Eswatini",
      "Lesotho",
      "Mauritius",
      "Seychelles",
      "Ghana",
      "Nigeria",
      "Egypt",
      "Ethiopia",
    ],
    note: "Most of these allow a stay of up to 30 days on arrival. Carry proof of accommodation and onward travel.",
  },
  {
    region: "Visa required in advance",
    countries: [
      "United Kingdom",
      "United States",
      "Canada",
      "Australia",
      "New Zealand",
      "Germany",
      "France",
      "Netherlands",
      "China",
      "India",
      "Pakistan",
      "Bangladesh",
      "Japan",
      "South Korea",
      "Russia",
    ],
    note: "Apply for a visitor visa before travel. Applications are usually channelled through the Immigration Advisory Group in your country of residence.",
  },
];

export type Season = {
  name: string;
  months: string;
  verdict: string;
  detail: string;
  crowds: string;
};

export const seasons: Season[] = [
  {
    name: "Dry season",
    months: "May to October",
    verdict: "The best window",
    detail:
      "Cool and clear, and the park roads are at their best. July and August need booking ahead because that is when Malawians travel home for the holidays and international visitors take leave at the same time.",
    crowds: "High in July and August",
  },
  {
    name: "Wet season",
    months: "November to April",
    verdict: "Green, cheap and quiet",
    detail:
      "Lodges drop rates because nobody comes, and the landscape is at its greenest. The trade-off is real: some dirt roads to lodges turn to mud, and boats can be cancelled on Lake Malawi when the weather turns.",
    crowds: "Low",
  },
  {
    name: "Shoulder months",
    months: "November, April",
    verdict: "The compromise",
    detail:
      "You get most of the green benefit with far fewer of the road problems. Warm, with some rain, but usually passable.",
    crowds: "Low",
  },
];

export type EntryNote = {
  title: string;
  detail: string;
};

export const entryNotes: EntryNote[] = [
  {
    title: "Yellow fever certificate",
    detail:
      "Required if you are arriving from a country with endemic yellow fever, including many routes via Europe. The certificate only becomes valid ten days after vaccination, so get it before you fly.",
  },
  {
    title: "Proof of accommodation",
    detail:
      "Immigration routinely asks where you are staying. Have the booking confirmation to hand rather than trying to recall a lodge name at the border.",
  },
  {
    title: "Onward travel",
    detail:
      "An onward or return ticket is expected. An open-ended stay with no exit plan invites questions.",
  },
  {
    title: "Money on arrival",
    detail:
      "Use an official bureau de change rather than anyone offering a better rate outside the bank. Card acceptance is improving in major hotels and lodges but is not universal, so carry cash for smaller places.",
  },
  {
    title: "Driving",
    detail:
      "Drive on the left, as elsewhere in the region. International driving permits are required and a rental agency will ask for one. Roads outside the main towns are frequently unpaved, so plan for long transfer times between sites.",
  },
];

export type Connectivity = {
  title: string;
  detail: string;
};

export const connectivity: Connectivity[] = [
  {
    title: "Mobile coverage",
    detail:
      "Airtel and TNM both have broad coverage along the major towns and along the lake. Coverage thins sharply inside parks — Nyika in particular has almost none. Download your maps before you leave.",
  },
  {
    title: "Data",
    detail:
      "Buy a local SIM at the airport or in Lilongwe and Blantyre. Local data is dramatically cheaper than roaming, and the mobile money app doubles as the practical way to pay for smaller purchases.",
  },
  {
    title: "Power",
    detail:
      "Load-shedding happens. Bring a power bank and treat any lodge advertising air conditioning and hot water as a genuine amenity worth paying for. Camps without mains power usually run on generator for a few hours in the evening.",
  },
  {
    title: "Money",
    detail:
      "The Kwacha is the only currency worth carrying. Foreign card withdrawal fees stack up quickly, and ATMs run dry around pay days. Withdraw in town before heading out to a lodge.",
  },
];

export const quickFacts: { label: string; value: string; note?: string }[] = [
  { label: "Currency", value: "Malawian Kwacha (MWK)" },
  { label: "Languages", value: "English, Chichewa", note: "English is used for anything official." },
  { label: "Main airports", value: "Kamuzu (KMI), Chileka (BLZ)" },
  { label: "Best time to visit", value: "May to October", note: "Peak in July and August." },
  { label: "Currency in lodges", value: "US dollars widely accepted", note: "Kwacha for everything smaller." },
  { label: "Driving side", value: "Left" },
];