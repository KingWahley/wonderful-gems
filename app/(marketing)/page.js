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

  try {
    const [
      fetchedDestinations,
      fetchedBlogs,
      fetchedMiniGuides,
      fetchedTours,
      fetchedHero,
      fetchedCta
    ] = await Promise.all([
      fetchDestinations(),
      fetchBlogs(),
      fetchMiniGuides(),
      fetchTours(),
      fetchSettings("home_hero"),
      fetchSettings("home_cta"),
    ]);
    destinations = fetchedDestinations || [];
    blogs = (fetchedBlogs || []).filter(item => (item.status || "Draft").toLowerCase() === "published");
    miniGuides = (fetchedMiniGuides || []).filter(item => (item.status || "published").toLowerCase() === "published");
    tours = fetchedTours || [];
    homeHero = fetchedHero;
    homeCta = fetchedCta;
  } catch (error) {
    console.error("Error fetching homepage data from Supabase:", error);
  }

  const featuredBlogs = blogs.filter((b) => b.isFresh || b.is_fresh);
  const featuredItineraries = miniGuides.filter((g) => g.type === "itinerary" && (g.details?.featured === "yes" || g.details?.featured === "Yes"));
  const featuredPocketGuides = miniGuides.filter((g) => g.type === "pocket" && (g.details?.featured === "yes" || g.details?.featured === "Yes"));
  const featuredTours = tours.filter((t) => (t.status || "").toLowerCase() === "published" && (t.featureOnHomepage === "Yes" || t.featureOnHomepage === "yes"));

  return (
    <>
      <Hero settings={homeHero} />
      {featuredBlogs.length > 0 && <FeaturedBlogs blogs={featuredBlogs} />}
      <FeaturedDestinations destinations={destinations} />
      {featuredItineraries.length > 0 && <FreshOffTheRoad miniGuides={featuredItineraries} />}
      {featuredTours.length > 0 && <FeaturedTours tours={featuredTours} />}
      <WhyTravelWithMe settings={homeCta} />
      {featuredPocketGuides.length > 0 && <Testimonials miniGuides={featuredPocketGuides} />}
    </>
  );
}
