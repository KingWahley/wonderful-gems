import Hero from "@/components/home/Hero";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import FreshOffTheRoad from "@/components/home/FreshOffTheRoad";
import WhyTravelWithMe from "@/components/home/WhyTravelWithMe";
import Testimonials from "@/components/home/Testimonials";
import { fetchDestinations, fetchBlogs, fetchMiniGuides, fetchSettings } from "@/lib/db";

export const revalidate = 0;

export default async function Home() {
  let destinations = [];
  let blogs = [];
  let miniGuides = [];
  let homeHero = null;
  let homeCta = null;

  try {
    const [
      fetchedDestinations,
      fetchedBlogs,
      fetchedMiniGuides,
      fetchedHero,
      fetchedCta
    ] = await Promise.all([
      fetchDestinations(),
      fetchBlogs(),
      fetchMiniGuides(),
      fetchSettings("home_hero"),
      fetchSettings("home_cta"),
    ]);
    destinations = fetchedDestinations || [];
    blogs = fetchedBlogs || [];
    miniGuides = fetchedMiniGuides || [];
    homeHero = fetchedHero;
    homeCta = fetchedCta;
  } catch (error) {
    console.error("Error fetching homepage data from Supabase:", error);
  }

  const popularBlogs = blogs.filter((b) => !b.isFresh);
  const freshBlogs = blogs.filter((b) => b.isFresh);

  return (
    <>
      <Hero settings={homeHero} />
      <FeaturedBlogs blogs={popularBlogs} />
      <FeaturedDestinations destinations={destinations} />
      <FreshOffTheRoad miniGuides={miniGuides} />
      <WhyTravelWithMe settings={homeCta} />
      <Testimonials miniGuides={miniGuides} />
    </>
  );
}
