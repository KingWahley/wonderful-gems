export const destinations = [
  {
    id: "1",
    slug: "italy",
    country: "Italy",
    description: "Experience the timeless beauty of Italy, where ancient history meets modern luxury.",
    whyILoveIt: "The perfect blend of culinary excellence, artistic heritage, and stunning landscapes.",
    moments: ["Sunset boat ride in Lake Como", "Private vineyard tour in Tuscany", "Exclusive access to Vatican Museums"],
    coverImage: "https://images.unsplash.com/photo-1516483638261-f4dafaf00bc6?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 12,
    toursCount: 5,
    region: "Europe"
  },
  {
    id: "2",
    slug: "japan",
    country: "Japan",
    description: "Discover a land where ancient traditions harmoniously coexist with cutting-edge technology.",
    whyILoveIt: "The meticulous attention to detail in everything from food to hospitality is unmatched.",
    moments: ["Cherry blossom viewing in Kyoto", "Staying in a luxury ryokan", "Omakase sushi experience in Tokyo"],
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 8,
    toursCount: 4,
    region: "Asia"
  },
  {
    id: "3",
    slug: "maldives",
    country: "Maldives",
    description: "Escape to a paradise of crystal-clear waters, white-sand beaches, and ultimate seclusion.",
    whyILoveIt: "It's the absolute pinnacle of barefoot luxury and disconnected relaxation.",
    moments: ["Overwater villa sunset views", "Private sandbank dining", "Snorkeling with manta rays"],
    coverImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?q=80&w=1000&auto=format&fit=crop"
    ],
    blogsCount: 4,
    toursCount: 2,
    region: "Asia"
  }
];

export const blogPosts = [
  {
    id: "1",
    slug: "ultimate-amalfi-coast-itinerary",
    title: "The Ultimate Amalfi Coast Itinerary",
    excerpt: "A curated 7-day journey through Italy's most glamorous coastline, featuring hidden gems and luxury stays.",
    readTime: "8 min read",
    destination: "Italy",
    city: "Amalfi Coast",
    author: "Elena Rossi",
    date: "May 12, 2026",
    tags: ["Itinerary", "Luxury", "Coastal"],
    coverImage: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2000&auto=format&fit=crop",
    content: "The Amalfi Coast is a stunning stretch of coastline along the Sorrentine Peninsula of Italy... (Full article content goes here)"
  },
  {
    id: "2",
    slug: "kyoto-hidden-temples",
    title: "Kyoto's Hidden Temples: A Private Guide",
    excerpt: "Escape the crowds and discover the serene, lesser-known spiritual sanctuaries of Kyoto.",
    readTime: "5 min read",
    destination: "Japan",
    city: "Kyoto",
    author: "Kenji Sato",
    date: "April 28, 2026",
    tags: ["Culture", "Guide", "Exclusive"],
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2000&auto=format&fit=crop",
    content: "While Kinkaku-ji and Fushimi Inari are spectacular, the true essence of Kyoto can be found... (Full article content goes here)"
  },
  {
    id: "3",
    slug: "maldives-resort-guide",
    title: "Choosing the Perfect Maldivian Resort",
    excerpt: "An insider's guide to the top luxury atolls in the Maldives and how to choose the right one for your style.",
    readTime: "10 min read",
    destination: "Maldives",
    city: "Male Atoll",
    author: "Sarah Jenkins",
    date: "March 15, 2026",
    tags: ["Resorts", "Honeymoon", "Guide"],
    coverImage: "https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=2000&auto=format&fit=crop",
    content: "With hundreds of private island resorts, selecting the perfect property in the Maldives can be... (Full article content goes here)"
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
    type: "pocket",
    slug: "paris-weekend",
    destination: "France",
    city: "Paris",
    title: "A Perfect Weekend in Paris",
    shortDescription: "The ultimate 48-hour guide to the City of Light.",
    bestTime: "April - June",
    idealDuration: "2-3 Days",
    budgetLevel: "$$$",
    heroImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "2",
    type: "itinerary",
    slug: "scotland-highlands",
    destination: "UK",
    route: "Edinburgh to Isle of Skye",
    title: "The Ultimate Scottish Highlands Road Trip",
    excerpt: "Drive through dramatic glens and ancient castles on this scenic route.",
    numberOfDays: 7,
    travelType: "Car",
    heroImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop"
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
