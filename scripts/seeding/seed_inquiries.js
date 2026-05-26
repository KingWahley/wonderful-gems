const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or env variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MOCK_INQUIRIES = [
  {
    name: "Maya Chen",
    email: "maya.chen@email.com",
    package: "Custom Itinerary",
    destinations: "Japan",
    dates: "Oct 2026",
    budget: "$4,500",
    travellers: "2 adults",
    status: "new",
    message: "We are planning a two-week trip to Japan and would like a slower route with Kyoto, Osaka, Nara and possibly a countryside stay. We care most about food, temples, trains and beautiful hotels.",
    notes: "Potential custom itinerary client. Ask about exact dates, hotel style, dietary needs and whether they want Tokyo included.",
    assigned_to: "Ava Wright",
    priority: "Normal",
    next_action: "Send reply",
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString() // 2 hours ago (Today)
  },
  {
    name: "Daniel Brooks",
    email: "daniel@email.com",
    package: "1 on 1 Consultation",
    destinations: "Portugal",
    dates: "June 2026",
    budget: "$2,000",
    travellers: "1 adult",
    status: "replied",
    message: "Looking to explore Lisbon, Porto, and the Douro Valley for 10 days. I love wine tasting, historic architecture, and local food spots.",
    notes: "Already replied. Scheduled a follow-up email next week.",
    assigned_to: "Ava Wright",
    priority: "Normal",
    next_action: "Schedule call",
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() // 1 day ago (Yesterday)
  },
  {
    name: "Amina Yusuf",
    email: "amina@email.com",
    package: "Full Concierge",
    destinations: "Italy",
    dates: "Sept 2026",
    budget: "$8,000",
    travellers: "3 adults",
    status: "converted",
    message: "Planning a family vacation to the Amalfi Coast and Rome. Want luxury private transfers, private boat charters, and skip-the-line tours.",
    notes: "Client converted! Booking confirmed and deposit paid.",
    assigned_to: "Ava Wright",
    priority: "High",
    next_action: "Send proposal",
    created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() // May 09 (Approx)
  },
  {
    name: "Leo Martins",
    email: "leo@email.com",
    package: "Custom Itinerary",
    destinations: "Greece",
    dates: "Aug 2026",
    budget: "$5,200",
    travellers: "2 adults",
    status: "new",
    message: "Dreaming of an island-hopping honeymoon in Santorini, Milos, and Naxos. We prefer boutique cave hotels and sunset dining.",
    notes: "Send honeymoons portfolio.",
    assigned_to: "Ava Wright",
    priority: "Normal",
    next_action: "Send reply",
    created_at: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString() // May 08
  },
  {
    name: "Sofia Rossi",
    email: "sofia@email.com",
    package: "1 on 1 Consultation",
    destinations: "Morocco",
    dates: "Flexible",
    budget: "$3,000",
    travellers: "2 adults",
    status: "follow-up",
    message: "Would love to see Marrakech, the Sahara Desert, and Chefchaouen. Seeking a balanced itinerary of adventure and relaxation.",
    notes: "Needs follow-up on desert camp preferences.",
    assigned_to: "Ava Wright",
    priority: "Normal",
    next_action: "Schedule call",
    created_at: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString() // May 06
  }
];

async function seed() {
  console.log("Seeding mock inquiries into Supabase to match the premium inquiries page mockup...");
  
  // Clear any existing test inquiries (optional, but ensures clean slate for mock view)
  const { error: deleteError } = await supabase
    .from('inquiries')
    .delete()
    .neq('name', 'ThisShouldNeverMatchAnyRowJustDeletingAllTestItemsForPerfectDemo');
    
  if (deleteError) {
    console.warn("Delete warning (might not exist yet):", deleteError.message);
  }

  // Insert Mock entries
  for (const inquiry of MOCK_INQUIRIES) {
    console.log(`Inserting inquiry from: "${inquiry.name}"...`);
    const { error } = await supabase
      .from('inquiries')
      .insert(inquiry);
      
    if (error) {
      console.error(`Failed to insert "${inquiry.name}":`, error.message);
      console.log(`Note: If you get a column error, run the SQL script to add new columns first!`);
    } else {
      console.log(`Successfully inserted "${inquiry.name}"!`);
    }
  }
  
  console.log("Mock inquiries seeding complete!");
}

seed();
