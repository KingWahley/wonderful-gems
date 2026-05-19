import Hero from "@/components/home/Hero";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import FreshOffTheRoad from "@/components/home/FreshOffTheRoad";
import WhyTravelWithMe from "@/components/home/WhyTravelWithMe";
import Testimonials from "@/components/home/Testimonials";
import { fetchDestinations, fetchBlogs, fetchMiniGuides } from "@/lib/db";

export const revalidate = 0;

export default async function Home() {
  let destinations = [];
  let blogs = [];
  let miniGuides = [];

  try {
    const [fetchedDestinations, fetchedBlogs, fetchedMiniGuides] = await Promise.all([
      fetchDestinations(),
      fetchBlogs(),
      fetchMiniGuides(),
    ]);
    destinations = fetchedDestinations || [];
    blogs = fetchedBlogs || [];
    miniGuides = fetchedMiniGuides || [];
  } catch (error) {
    console.error("Error fetching homepage data from Supabase:", error);
  }

  const popularBlogs = blogs.filter((b) => !b.isFresh);
  const freshBlogs = blogs.filter((b) => b.isFresh);

  return (
    <>
      <Hero />
      <FeaturedBlogs blogs={popularBlogs} />
      <FeaturedDestinations destinations={destinations} />
      <FreshOffTheRoad freshPosts={freshBlogs} />
      <WhyTravelWithMe />
      <Testimonials miniGuides={miniGuides} />
    </>
  );
}
