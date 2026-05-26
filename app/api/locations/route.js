import { NextResponse } from "next/server";

export const runtime = "edge";


let cachedData = null;

export async function GET() {
  if (cachedData) {
    return NextResponse.json(cachedData);
  }

  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries", {
      next: { revalidate: 86400 } // Cache for 24 hours
    });
    const json = await res.json();
    if (json && !json.error && json.data) {
      // Map API fields to simplified schema
      const mapped = json.data.map(item => ({
        country: item.country,
        iso2: item.iso2,
        iso3: item.iso3,
        cities: item.cities || []
      }));
      cachedData = mapped;
      return NextResponse.json(mapped);
    }
  } catch (error) {
    console.warn("Failed to fetch locations from countriesnow API, using fallback data:", error.message);
  }

  // Robust fallback data covering major travel countries and major cities
  const fallback = [
    { country: "Japan", iso2: "JP", iso3: "JPN", cities: ["Kyoto", "Tokyo", "Osaka", "Nara", "Hakone", "Hiroshima", "Sapporo", "Okinawa", "Kobe", "Fukuoka", "Nagoya", "Kanazawa", "Takayama", "Niseko"] },
    { country: "Morocco", iso2: "MA", iso3: "MAR", cities: ["Marrakech", "Fes", "Casablanca", "Chefchaouen", "Rabat", "Tangier", "Essaouira", "Ouarzazate", "Agadir", "Meknes"] },
    { country: "Portugal", iso2: "PT", iso3: "PRT", cities: ["Lisbon", "Porto", "Sintra", "Algarve", "Coimbra", "Evora", "Braga", "Faro", "Cascais", "Lagos", "Guimaraes", "Madeira"] },
    { country: "Italy", iso2: "IT", iso3: "ITA", cities: ["Rome", "Florence", "Venice", "Milan", "Amalfi Coast", "Naples", "Turin", "Palermo", "Bologna", "Positano", "Siena", "Pisa", "Verona", "Genoa", "Bari"] },
    { country: "France", iso2: "FR", iso3: "FRA", cities: ["Paris", "Nice", "Lyon", "Bordeaux", "Provence", "Marseille", "Strasbourg", "Toulouse", "Lille", "Chamonix", "Cannes", "Nantes", "Montpellier"] },
    { country: "United States", iso2: "US", iso3: "USA", cities: ["New York City", "Los Angeles", "Chicago", "San Francisco", "Miami", "Seattle", "Austin", "Boston", "Las Vegas", "Denver", "Washington DC", "Honolulu", "New Orleans"] },
    { country: "United Kingdom", iso2: "GB", iso3: "GBR", cities: ["London", "Edinburgh", "Manchester", "Bath", "Oxford", "Cambridge", "Liverpool", "York", "Bristol", "Glasgow", "Belfast", "Cardiff"] },
    { country: "Nigeria", iso2: "NG", iso3: "NGA", cities: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Benin City", "Kaduna", "Calabar", "Warri", "Jos", "Uyo", "Owerri"] },
    { country: "Canada", iso2: "CA", iso3: "CAN", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Quebec City", "Halifax", "Edmonton", "Victoria", "Winnipeg", "Whistler"] },
    { country: "Brazil", iso2: "BR", iso3: "BRA", cities: ["Rio de Janeiro", "Sao Paulo", "Salvador", "Brasilia", "Manaus", "Recife", "Fortaleza", "Belo Horizonte", "Curitiba", "Florianopolis"] },
    { country: "Spain", iso2: "ES", iso3: "ESP", cities: ["Barcelona", "Madrid", "Seville", "Valencia", "Granada", "Mallorca", "Ibiza", "Malaga", "Bilbao", "San Sebastian", "Cordoba", "Toledo"] },
    { country: "Iceland", iso2: "IS", iso3: "ISL", cities: ["Reykjavík", "Akureyri", "Vik", "Keflavik", "Husavik", "Seydisfjordur", "Selfoss"] },
    { country: "Vietnam", iso2: "VN", iso3: "VNM", cities: ["Hanoi", "Ho Chi Minh City", "Hoi An", "Da Nang", "Nha Trang", "Hue", "Ha Long Bay", "Sapa", "Phu Quoc", "Can Tho"] },
    { country: "Chile", iso2: "CL", iso3: "CHL", cities: ["Santiago", "Valparaiso", "San Pedro de Atacama", "Puerto Natales", "Punta Arenas", "Vina del Mar"] },
    { country: "Mexico", iso2: "MX", iso3: "MEX", cities: ["Mexico City", "Oaxaca", "Cancun", "Tulum", "Guadalajara", "Monterrey", "Cabo San Lucas", "Puerto Vallarta", "Merida", "Playa del Carmen"] }
  ];

  cachedData = fallback;
  return NextResponse.json(fallback);
}
