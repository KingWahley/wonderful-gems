import Hero from "@/components/home/Hero";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import FreshOffTheRoad from "@/components/home/FreshOffTheRoad";
import WhyTravelWithMe from "@/components/home/WhyTravelWithMe";
import Testimonials from "@/components/home/Testimonials";
import FeaturedTours from "@/components/home/FeaturedTours";
import { fetchDestinations, fetchBlogs, fetchMiniGuides, fetchSettings, fetchTours } from "@/lib/db";

export const revalidate = 0;

export default async function Home() {
  let destinations = [];
  let blogs = [];
  let miniGuides = [];
  let tours = [];
  let homeHero = null;
  let homeCta = null;
  let homeLatestPosts = null;
  let homeDestinations = null;
  let homeMiniGuides = null;
  let homePocketGuides = null;
  let homeTours = null;

  try {
    const [
      fetchedDestinations,
      fetchedBlogs,
      fetchedMiniGuides,
      fetchedTours,
      fetchedHero,
      fetchedCta,
      fetchedLatestPosts,
      fetchedHomeDests,
      fetchedHomeGuides,
      fetchedHomePocketGuides,
      fetchedHomeTours
    ] = await Promise.all([
      fetchDestinations(),
      fetchBlogs(),
      fetchMiniGuides(),
      fetchTours(),
      fetchSettings("home_hero"),
      fetchSettings("home_cta"),
      fetchSettings("home_latest_posts"),
      fetchSettings("home_destinations"),
      fetchSettings("home_mini_guides"),
      fetchSettings("home_pocket_guides"),
      fetchSettings("home_tours")
    ]);
    destinations = fetchedDestinations || [];
    blogs = (fetchedBlogs || []).filter(item => (item.status || "Draft").toLowerCase() === "published");
    miniGuides = (fetchedMiniGuides || []).filter(item => (item.status || "published").toLowerCase() === "published");
    tours = fetchedTours || [];
    homeHero = fetchedHero;
    homeCta = fetchedCta;
    homeLatestPosts = fetchedLatestPosts;
    homeDestinations = fetchedHomeDests;
    homeMiniGuides = fetchedHomeGuides;
    homePocketGuides = fetchedHomePocketGuides;
    homeTours = fetchedHomeTours;
  } catch (error) {
    console.error("Error fetching homepage data from Supabase:", error);
  }

  // Filter blogs based on CMS selection
  let featuredBlogs = [];
  if (homeLatestPosts && homeLatestPosts.items && homeLatestPosts.items.length > 0) {
    featuredBlogs = homeLatestPosts.items.map(id => blogs.find(b => b.id === id)).filter(Boolean);
  } else {
    featuredBlogs = blogs.filter((b) => b.isFresh || b.is_fresh).slice(0, 3);
  }

  // Filter destinations based on CMS selection
  let displayDestinations = [];
  if (homeDestinations && homeDestinations.items && homeDestinations.items.length > 0) {
    displayDestinations = homeDestinations.items.map(id => destinations.find(d => d.id === id)).filter(Boolean);
  } else {
    displayDestinations = destinations; // Component handles fallback slice
  }

  // Filter tours based on CMS selection
  let featuredToursList = [];
  if (homeTours && homeTours.items && homeTours.items.length > 0) {
    featuredToursList = homeTours.items.map(id => tours.find(t => t.id === id)).filter(Boolean);
  } else {
    featuredToursList = tours.filter((t) => (t.status || "").toLowerCase() === "published" && (t.featureOnHomepage === "Yes" || t.featureOnHomepage === "yes"));
  }

  // Filter guides based on CMS selection
  let selectedGuides = [];
  if (homeMiniGuides && homeMiniGuides.items && homeMiniGuides.items.length > 0) {
    selectedGuides = homeMiniGuides.items.map(id => miniGuides.find(g => g.id === id)).filter(Boolean);
  } else {
    selectedGuides = miniGuides.filter((g) => g.details?.featured === "yes" || g.details?.featured === "Yes");
  }

  let selectedPocketGuides = [];
  if (homePocketGuides && homePocketGuides.items && homePocketGuides.items.length > 0) {
    selectedPocketGuides = homePocketGuides.items.map(id => miniGuides.find(g => g.id === id)).filter(Boolean);
  } else {
    selectedPocketGuides = miniGuides.filter((g) => g.details?.featured === "yes" || g.details?.featured === "Yes");
  }

  const featuredItineraries = selectedGuides.filter((g) => g.type === "itinerary");
  const featuredPocketGuides = selectedPocketGuides.filter((g) => g.type === "pocket");

  return (
    <>
      {(!homeHero || homeHero.enabled) && <Hero settings={homeHero} />}
      {(!homeLatestPosts || homeLatestPosts.enabled) && featuredBlogs.length > 0 && <FeaturedBlogs blogs={featuredBlogs} settings={homeLatestPosts} />}
      {(!homeDestinations || homeDestinations.enabled) && <FeaturedDestinations destinations={displayDestinations} settings={homeDestinations} />}
      {(!homeMiniGuides || homeMiniGuides.enabled) && featuredItineraries.length > 0 && <FreshOffTheRoad miniGuides={featuredItineraries} settings={homeMiniGuides} />}
      {(!homeTours || homeTours.enabled) && featuredToursList.length > 0 && <FeaturedTours tours={featuredToursList} settings={homeTours} />}
      {(!homeCta || homeCta.enabled) && <WhyTravelWithMe settings={homeCta} />}
      {(!homePocketGuides || homePocketGuides.enabled) && featuredPocketGuides.length > 0 && <Testimonials miniGuides={featuredPocketGuides} settings={homePocketGuides} />}
    </>
  );
}
