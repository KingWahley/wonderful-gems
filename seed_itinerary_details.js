const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const itinerariesData = {
  "four-days-in-belgium": {
    pocketTitle: "BELGIUM MINI GUIDE • POCKET VERSION",
    itineraryTitle: "4 DAYS IN BELGIUM • FULL ITINERARY",
    blogCountText: "3 POSTS FROM BELGIUM",
    introText: "A four day loop across Brussels, Bruges, and Ghent — where to stay, what to do, and the best way to get around.",
    introHtml: "Belgium is far more than chocolate, beer, and bureaucratic buildings. It is a country of intense historic beauty, with medieval canals, soaring cathedral spires, and some of the best art and culinary scenes in Europe. This four-day itinerary focuses on the core highlights of Flanders: the historic grandeur of Brussels, the fairy-tale romantic canals of Bruges, and the vibrant, student-led gothic streets of Ghent.",
    routeTitle: "4-day route",
    routeFlow: "Brussels, Bruges, Ghent, Brussels",
    days: [
      {
        dayNum: "01",
        title: "Brussels — landing softly",
        color: "yellow",
        essence: "Landing day in the capital of Europe. Take the train from the airport to the city center, check into your hotel, and start exploring the historic heart. Keep it simple and focus on the sheer gothic scale of the Grand Place at sunset.",
        whatToDo: "Check into your central hotel near the Grand Place\nExplore the Grand Place and marvel at the guildhalls\nGrab a warm, caramelized Liege waffle from a street corner\nToast with your first Belgian dubbel at a historic tavern",
        stayName: "The Hoxton, Brussels",
        stayTier: "Mid-range",
        stayDesc: "Chic retro interiors, a stunning botanical garden view rooftop, and clean, high-design rooms in the northern botanical quarter.",
        eatDrinkName: "A la Mort Subite",
        eatDrinkDesc: "A historic 1910 tavern serving their signature Mort Subite Gueuze and lambic beers.",
        transitionTo: "Bruges",
        transitionTime: "30 mins travel"
      },
      {
        dayNum: "02",
        title: "Brussels -> Bruges",
        color: "blue",
        essence: "Board an early morning train to the fairy-tale medieval city of Bruges. Drop your bags and step back in time. Spend the afternoon wandering through cobblestone alleys, crossing ancient stone bridges, and taking in the swans along the Lake of Love.",
        whatToDo: "Take a morning train from Brussels to Bruges (1 hour)\nClimb the historic Belfry of Bruges for panoramic views\nTake a quiet boat cruise along the medieval canals\nSample handmade chocolates at artisan praliners",
        stayName: "Hotel Heritage",
        stayTier: "Splurge",
        stayDesc: "A Relais & Châteaux boutique hotel set inside a grand 19th-century private mansion with a beautiful vaulted spa.",
        eatDrinkName: "Brouwerij De Halve Maan",
        eatDrinkDesc: "The city's last active brewery, famous for Brugse Zot and their underground beer pipeline.",
        transitionTo: "Ghent",
        transitionTime: "25 mins travel"
      },
      {
        dayNum: "03",
        title: "Day trip — Ghent",
        color: "green",
        essence: "A short train hop brings you to Ghent, Flanders' best-kept secret. Ghent mixes stunning medieval canal fronts with a youthful, artistic university vibe. Witness the Adoration of the Mystic Lamb altarpiece and watch the lights reflect on the Graslei canal at night.",
        whatToDo: "Hop a 25-minute train to the vibrant city of Ghent\nView the masterpiece Ghent Altarpiece in St. Bavo's Cathedral\nWander the stunning Graslei and Korenlei canal quays\nExplore the medieval Castle of the Counts (Gravensteen)",
        stayName: "1898 The Post",
        stayTier: "Splurge",
        stayDesc: "Stunning boutique rooms designed inside a gorgeous neo-gothic former post office building next to the scenic Korenlei canal.",
        eatDrinkName: "Oakhaven Cafe",
        eatDrinkDesc: "Cozy canal-side cafe serving artisan coffees, local beer flights, and warm Belgian pastries.",
        transitionTo: "Brussels",
        transitionTime: "35 mins travel"
      },
      {
        dayNum: "04",
        title: "Bruges -> Brussels & Home",
        color: "red",
        essence: "Make your way back to Brussels for any final sights, chocolate shopping, and a proper celebratory farewell lunch before heading to the airport or catching the Eurostar home.",
        whatToDo: "Return to Brussels Central via morning train\nStock up on premium chocolates at Pierre Marcolini in Sablon\nVisit the surreal Atomium or the Royal Museum of Fine Arts\nEnjoy a traditional Moules-Frites lunch at a local bistro",
        stayName: "Standard Stay (Airport/Midi)",
        stayTier: "Budget",
        stayDesc: "Clean, efficient transit hotels convenient for early morning flights or trains.",
        eatDrinkName: "Aux Armes de Bruxelles",
        eatDrinkDesc: "A historic institution in the heart of the city serving legendary Moules-Frites and traditional carbonnade.",
        transitionTo: "",
        transitionTime: ""
      }
    ]
  },
  "two-weeks-in-italy": {
    pocketTitle: "ITALY MINI GUIDE • POCKET VERSION",
    itineraryTitle: "2 WEEKS IN ITALY • FULL ITINERARY",
    blogCountText: "5 POSTS FROM ITALY",
    introText: "A spectacular multi-week route traversing Rome, Florence, Tuscany, and Venice — with the best regional stays and bites.",
    introHtml: "Italy captures the imagination like nowhere else on Earth. From the ancient marble monuments of Rome and the Renaissance masterpieces of Florence, to the sun-soaked cliffs of the coast, this two-week itinerary takes you through the very best of classic Italy. Designed to balance major historical highlights with slow, local travel experiences, it tells you exactly where to stay, what to do, and how to get around by train.",
    routeTitle: "14-day route",
    routeFlow: "Rome, Florence, Tuscany, Venice, Rome",
    days: [
      {
        dayNum: "01",
        title: "Rome — landing in the eternal city",
        color: "yellow",
        essence: "Arrive in Rome, settle in your hotel in Trastevere, and enjoy a quiet evening walk around the iconic Pantheon and Piazza Navona.",
        whatToDo: "Check in to a cozy boutique hotel in Trastevere\nVisit the historic Pantheon at dusk\nGrab a plate of rich, creamy cacio e pepe at a local osteria",
        stayName: "Boutique Hotel Trastevere",
        stayTier: "Mid-range",
        stayDesc: "Charming rooms set in a quiet piazza with classic shuttered windows and an authentic breakfast room.",
        eatDrinkName: "Da Enzo al 29",
        eatDrinkDesc: "Unbelievable traditional Roman pastas, artichokes, and house red wine in a lively corner.",
        transitionTo: "Florence",
        transitionTime: "1.5 hours travel"
      },
      {
        dayNum: "02",
        title: "Rome -> Florence",
        color: "blue",
        essence: "Catch a morning high-speed train to Florence, the cradle of the Renaissance. Spend your afternoon admiring the Duomo and walking Ponte Vecchio.",
        whatToDo: "Take high-speed Frecciarossa train north to Florence\nAdmire Brunelleschi's magnificent Duomo dome\nCross the historic Ponte Vecchio at sunset",
        stayName: "Plaza Hotel Lucchesi",
        stayTier: "Mid-range",
        stayDesc: "Rooftop terrace pool with 360-degree views of the Florentine skyline and Arno river.",
        eatDrinkName: "All'Antico Vinaio",
        eatDrinkDesc: "World-famous legendary focaccia sandwiches piled high with fresh tuscan charcuterie.",
        transitionTo: "Tuscany",
        transitionTime: "1 hour travel"
      },
      {
        dayNum: "03",
        title: "Florence -> Tuscany",
        color: "green",
        essence: "Head south into the rolling hills of Tuscany. Enjoy a day trip wandering the medieval towers of San Gimignano and tasting local Chianti wines.",
        whatToDo: "Rent a vintage car or board a regional bus south into the Tuscan hills\nExplore the medieval skyscraper village of San Gimignano\nTone your senses with a local Chianti winery tasting",
        stayName: "Belmond Villa San Michele",
        stayTier: "Splurge",
        stayDesc: "A former 15th-century monastery with a facade designed by Michelangelo, offering breathtaking views of Florence.",
        eatDrinkName: "Osteria di Passignano",
        eatDrinkDesc: "Michelin-starred dining in a historic monastery vault, featuring exceptional local wines.",
        transitionTo: "Venice",
        transitionTime: "2.5 hours travel"
      },
      {
        dayNum: "04",
        title: "Tuscany -> Venice",
        color: "red",
        essence: "Arrive at the floating city of Venice. Settle in your hotel away from the main crowds in Cannaregio and enjoy cicchetti by the canal.",
        whatToDo: "Take the train north to Venice Santa Lucia\nRide a traditional vaporetto along the Grand Canal\nEnjoy local cicchetti tapas at a quiet bacaro tavern",
        stayName: "La Torretta Lodge",
        stayTier: "Splurge",
        stayDesc: "Stunning views from romantic cliffside suites overlooking the sparkling turquoise sea.",
        eatDrinkName: "Trattoria Gianni Franzi",
        eatDrinkDesc: "Legendary trofie pasta with fresh basil pesto served in a lively central piazza.",
        transitionTo: "",
        transitionTime: ""
      }
    ]
  },
  "seven-days-in-portugal": {
    pocketTitle: "PORTUGAL MINI GUIDE • POCKET VERSION",
    itineraryTitle: "7 DAYS IN PORTUGAL • FULL ITINERARY",
    blogCountText: "4 POSTS FROM PORTUGAL",
    introText: "A scenic road trip from Lisbon up to Porto, including Sintra's castles and Douro Valley vineyards.",
    introHtml: "Portugal is a land of sunlight, cobblestones, and soul-stirring landscapes. This seven-day itinerary maps out the perfect loop: starting in the historic quarters of Lisbon, winding through the fairy-tale pine forests of Sintra, heading north to the riverside hills of Porto, and ending with a glass of port in the terraced vineyards of the Douro Valley.",
    routeTitle: "7-day route",
    routeFlow: "Lisbon, Sintra, Porto, Douro Valley, Lisbon",
    days: [
      {
        dayNum: "01",
        title: "Lisbon — city of seven hills",
        color: "yellow",
        essence: "Arrive in Lisbon, drop your bags, and ride the classic Tram 28 up to the high historic district of Alfama for golden hour views.",
        whatToDo: "Check into a boutique riad-style guest house in Alfama\nRide the legendary Tram 28 through narrow historic streets\nWatch the sunset from Miradouro da Senhora do Monte",
        stayName: "Memmo Alfama Hotel",
        stayTier: "Splurge",
        stayDesc: "A pristine white boutique hotel set directly inside Alfama, with a gorgeous red-tiled rooftop pool overlooking the Tagus.",
        eatDrinkName: "Taberna do Sal Grosso",
        eatDrinkDesc: "Stunning small-plate traditional taverna serving delicious petiscos and local red wines.",
        transitionTo: "Sintra",
        transitionTime: "40 mins travel"
      },
      {
        dayNum: "02",
        title: "Lisbon -> Sintra",
        color: "blue",
        essence: "Take a quick morning train to Sintra, a fairy-tale mountain kingdom of romantic castles, pristine forests, and misty gardens.",
        whatToDo: "Board a direct train from Rossio station to Sintra\nTour the surreal Pena Palace with its bright yellow walls\nWander the mysterious initiation wells of Quinta da Regaleira",
        stayName: "Tivoli Palácio de Seteais",
        stayTier: "Splurge",
        stayDesc: "An 18th-century palace hotel with ornate frescoes, lush formal gardens, and majestic valley views.",
        eatDrinkName: "Cafe Saudade",
        eatDrinkDesc: "A historic tearoom serving freshly baked scones, local travesseiro pastries, and herbal infusions.",
        transitionTo: "Porto",
        transitionTime: "3 hours travel"
      },
      {
        dayNum: "03",
        title: "Sintra -> Porto",
        color: "green",
        essence: "Board a northbound train to Porto. Spend the afternoon walking across the iconic Dom Luís I Bridge and exploring Ribeira.",
        whatToDo: "Take a scenic train north to Campanhã station\nWalk the high deck of Dom Luís I Bridge over the Douro river\nExplore the colorful riverfront medieval houses of Ribeira",
        stayName: "The Yeatman Hotel",
        stayTier: "Splurge",
        stayDesc: "A luxury wine hotel in Vila Nova de Gaia with a decanter-shaped pool overlooking the Porto historic core.",
        eatDrinkName: "Cantinho do Avillez",
        eatDrinkDesc: "Creative modern twists on classic Portuguese cooking in a bright and lively bistro setting.",
        transitionTo: "Douro Valley",
        transitionTime: "2 hours travel"
      },
      {
        dayNum: "04",
        title: "Porto -> Douro Valley",
        color: "red",
        essence: "Take a historic steam train or drive up the winding Douro River valley, the oldest demarcated wine region in the world, for terrace vineyard tastings.",
        whatToDo: "Take the highly scenic train from São Bento to Pinhão\nTour a traditional terraced vineyard estate (Quinta)\nEnjoy a sunset boat cruise on a traditional rabelo boat",
        stayName: "Six Senses Douro Valley",
        stayTier: "Splurge",
        stayDesc: "A beautifully restored 19th-century manor house set on a hill overlooking the Douro River, featuring a world-class wellness spa.",
        eatDrinkName: "DOC Restaurant by Rui Paula",
        eatDrinkDesc: "Exceptional modern fine dining floating right on the Douro river waters, featuring masterfully prepared regional delicacies.",
        transitionTo: "",
        transitionTime: ""
      }
    ]
  }
};

async function run() {
  try {
    const { data: dbGuides, error: fetchError } = await supabase
      .from('mini_guides')
      .select('id, slug');

    if (fetchError) {
      throw fetchError;
    }

    console.log('Fetched guides from database:', dbGuides);

    for (const guide of dbGuides) {
      const details = itinerariesData[guide.slug.toLowerCase()];
      if (details) {
        console.log(`Updating itinerary details for guide: ${guide.slug}...`);
        const { error: updateError } = await supabase
          .from('mini_guides')
          .update({ details })
          .eq('id', guide.id);
        
        if (updateError) {
          console.error(`Failed to update ${guide.slug}:`, updateError);
        } else {
          console.log(`Successfully updated ${guide.slug}!`);
        }
      }
    }
  } catch (err) {
    console.error('Error migrating data:', err);
  }
}

run();
