export const destinations = [
  {
    id: "1",
    slug: "belgium",
    country: "Belgium",
    code: "BE",
    description: "Discover the heart of Europe, full of medieval towns, incredible chocolate, and world-class beer.",
    whyILoveIt: "A tiny country packed with deep history, stunning architecture, and unparalleled gastronomy.",
    moments: ["Eating waffles in Bruges", "Exploring grand architecture in Brussels", "Tasting local Trappist beers"],
    coverImage: "https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 1,
    toursCount: 2,
    region: "Europe"
  },
  {
    id: "2",
    slug: "japan",
    country: "Japan",
    code: "JP",
    description: "Discover a land where ancient traditions harmoniously coexist with cutting-edge technology.",
    whyILoveIt: "The meticulous attention to detail in everything from food to hospitality is unmatched.",
    moments: ["Cherry blossom viewing in Kyoto", "Staying in a luxury ryokan", "Omakase sushi experience in Tokyo"],
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 2,
    toursCount: 4,
    region: "Asia"
  },
  {
    id: "3",
    slug: "portugal",
    country: "Portugal",
    code: "PT",
    description: "Experience the sun-drenched coastlines, historic tiles, and the melancholic beauty of Fado.",
    whyILoveIt: "The pace of life here makes it impossible not to slow down and savor every moment.",
    moments: ["Sunset over the Douro River", "Wandering the steep streets of Alfama", "Surfing in the Algarve"],
    coverImage: "https://images.unsplash.com/photo-1513622470522-26cb33260feb?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 2,
    toursCount: 3,
    region: "Europe"
  },
  {
    id: "4",
    slug: "chile",
    country: "Chile",
    code: "CL",
    description: "A narrow strip of land offering some of the most dramatic and extreme landscapes on earth.",
    whyILoveIt: "It feels like exploring the very edge of the world, untouched and immensely powerful.",
    moments: ["Hiking in Torres del Paine", "Stargazing in the Atacama Desert", "Wine tasting in Valle Central"],
    coverImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 1,
    toursCount: 1,
    region: "South America"
  },
  {
    id: "5",
    slug: "mexico",
    country: "Mexico",
    code: "MX",
    description: "Vibrant colors, ancient ruins, and a culinary scene that will leave you wanting more.",
    whyILoveIt: "The warmth of the people and the incredible depth of the culture are endlessly inspiring.",
    moments: ["Exploring cenotes in Tulum", "Street tacos in Mexico City", "Discovering Oaxacan artisans"],
    coverImage: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 1,
    toursCount: 2,
    region: "North America"
  }
];

export const blogPosts = [
  {
    id: "1",
    slug: "slow-mornings-in-kyoto",
    title: "Slow Mornings in Kyoto",
    excerpt: "Escape the crowds and discover the serene, lesser-known spiritual sanctuaries of Kyoto.",
    readTime: "5 min read",
    destination: "Japan",
    countryCode: "JP",
    city: "Kyoto",
    author: "Kenji Sato",
    date: "KYOTO · APRIL 2025",
    tags: ["Culture", "Guide", "Exclusive"],
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
    content: "While Kinkaku-ji and Fushimi Inari are spectacular, the true essence of Kyoto can be found... (Full article content goes here)"
  },
  {
    id: "2",
    slug: "lisbon-hour-before-dinner",
    title: "Lisbon, in the Hour Before Dinner",
    excerpt: "A curated 7-day journey through Italy's most glamorous coastline, featuring hidden gems and luxury stays.",
    readTime: "8 min read",
    destination: "Portugal",
    countryCode: "PT",
    city: "Alfama",
    author: "Elena Rossi",
    date: "ALFAMA · SEPTEMBER 2024",
    tags: ["Itinerary", "Luxury", "Coastal"],
    coverImage: "https://images.unsplash.com/photo-1513622470522-26cb33260feb?q=80&w=2000&auto=format&fit=crop",
    content: "The Amalfi Coast is a stunning stretch of coastline along the Sorrentine Peninsula of Italy... (Full article content goes here)"
  },
  {
    id: "3",
    slug: "five-days-edge-of-patagonia",
    title: "Five Days at the Edge of Patagonia",
    excerpt: "An insider's guide to the top luxury atolls in the Maldives and how to choose the right one for your style.",
    readTime: "10 min read",
    destination: "Chile",
    countryCode: "CL",
    city: "Torres Del Paine",
    author: "Sarah Jenkins",
    date: "TORRES DEL PAINE · FEBRUARY 2025",
    tags: ["Resorts", "Honeymoon", "Guide"],
    coverImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop",
    content: "With hundreds of private island resorts, selecting the perfect property in the Maldives can be... (Full article content goes here)"
  }
];

export const freshPosts = [
  {
    id: "1",
    slug: "seven-days-in-portugal",
    title: "Seven Days in Portugal: A Long-Read Itinerary",
    excerpt: "A comprehensive journey from the historic streets of Lisbon to the terraced vineyards of the Douro Valley.",
    destination: "Portugal",
    countryCode: "PT",
    date: "LISBON · SINTRA · ÉVORA · PORTO · DOURO VALLEY · OCTOBER 2025",
    coverImage: "https://images.unsplash.com/photo-1513622470522-26cb33260feb?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "2",
    slug: "four-days-in-belgium",
    title: "How to Spend 4 Days in Belgium",
    excerpt: "The perfect short break exploring the architectural wonders and culinary delights of Flanders.",
    destination: "Belgium",
    countryCode: "BE",
    date: "BRUSSELS · BRUGES · GHENT · SEPTEMBER 2025",
    coverImage: "https://images.unsplash.com/photo-1549877452-9c387954fbc2?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "3",
    slug: "two-weeks-in-italy",
    title: "How to Spend 2 Weeks in Italy",
    excerpt: "An epic 14-day route capturing the essence of Italy, from ancient ruins to cinematic coastlines.",
    destination: "Italy",
    countryCode: "IT",
    date: "ROME · FLORENCE · TUSCANY · CINQUE TERRE · AMALFI · MAY 2025",
    coverImage: "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=2000&auto=format&fit=crop"
  }
];

export const tours = [
  {
    id: "1",
    slug: "tuscany-wine-and-art",
    title: "Tuscan Wine & Art Private Immersion",
    destination: "Italy",
    duration: "5 Days",
    shortDescription: "A private journey through Chianti vineyards and Renaissance masterpieces.",
    description: "Experience the rolling hills of Tuscany from a private villa, complete with exclusive wine tastings, a private chef, and VIP access to Florence's most prestigious galleries.",
    price: "$4,500 pp",
    included: ["5 Nights Luxury Villa", "Private Chef", "VIP Uffizi Tickets", "3 Wine Tastings", "Private Driver"],
    excluded: ["International Flights", "Travel Insurance", "Personal Purchases"],
    heroImage: "https://images.unsplash.com/photo-1516483638261-f4dafaf00bc6?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop"
    ],
    availability: "Year-round (Best May-October)"
  },
  {
    id: "2",
    slug: "japan-culinary-tour",
    title: "Japan Haute Cuisine & Culture",
    destination: "Japan",
    duration: "10 Days",
    shortDescription: "An exclusive culinary journey from Tokyo's sushi counters to Kyoto's kaiseki.",
    description: "Savor the absolute best of Japanese cuisine with secured reservations at Michelin-starred restaurants, private tea ceremonies, and stays at ultra-luxury ryokans.",
    price: "$8,200 pp",
    included: ["10 Nights 5-Star/Ryokan", "All Michelin Dinners", "First-Class Bullet Train", "Private Guides"],
    excluded: ["International Flights", "Alcohol (unless specified)"],
    heroImage: "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop"
    ],
    availability: "Spring & Autumn"
  }
];

export const miniGuides = [
  {
    id: "1",
    slug: "marrakech",
    countryCode: "MA",
    destination: "Morocco",
    title: "Marrakech Travel Guide",
    excerpt: "Marrakech is one of those places that exceeds every expectation and then some. Colourful, vibrant, full-on — the kind of trip you start planning your return to before it's even over. This pocket...",
    heroImage: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "2",
    slug: "kyoto",
    countryCode: "JP",
    destination: "Japan",
    title: "Kyoto Travel Guide",
    excerpt: "Kyoto rewards a slower pace. This guide pulls together the temples worth seeing, where to stay across price points, and the small counters and rituals that turn a trip here into something...",
    heroImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "3",
    slug: "lisbon",
    countryCode: "PT",
    destination: "Portugal",
    title: "Lisbon Travel Guide",
    excerpt: "Lisbon is a city of inclines, golden hours, and small counters where the woman behind the bar starts your order before you sit down. This guide is the pocket version: where to stay, what t...",
    heroImage: "https://images.unsplash.com/photo-1513622470522-26cb33260feb?q=80&w=2000&auto=format&fit=crop"
  }
];

export const packages = [
  {
    id: "1",
    title: "1-on-1 Consultation",
    price: "$150",
    shortDescription: "A 60-minute strategy call to brainstorm ideas, review your current plans, and provide expert advice.",
    offerings: [
      "60-minute video call",
      "Destination recommendations",
      "Hotel & activity suggestions",
      "Follow-up email with summary notes"
    ]
  },
  {
    id: "2",
    title: "Custom Itinerary",
    price: "$450+",
    shortDescription: "A fully personalized day-by-day itinerary designed entirely around your travel style and preferences.",
    offerings: [
      "Everything in Consultation",
      "Detailed day-by-day plan",
      "Curated hotel & dining lists",
      "Interactive digital itinerary map",
      "Direct booking links provided"
    ]
  },
  {
    id: "3",
    title: "Full Concierge",
    price: "$1,200+",
    shortDescription: "The ultimate luxury service. We handle every single detail, from flights and VIP transfers to exclusive reservations.",
    offerings: [
      "Everything in Custom Itinerary",
      "All bookings managed for you",
      "VIP perks & upgrades (when available)",
      "24/7 support during travel",
      "Restaurant & spa reservations"
    ]
  }
];

export const testimonials = [
  {
    id: "1",
    name: "Sarah & Mark T.",
    text: "Our honeymoon in the Maldives was absolutely flawless. The attention to detail and VIP treatment at every step made it a once-in-a-lifetime experience. We'll never plan a trip without this service again.",
    destination: "Maldives",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500&auto=format&fit=crop"
  },
  {
    id: "2",
    name: "James L.",
    text: "The Kyoto itinerary was a masterpiece. Having access to private temples and reservations at incredible sushi counters that I could never have booked myself was incredible.",
    destination: "Japan",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500&auto=format&fit=crop"
  }
];
