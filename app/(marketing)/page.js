import Hero from "@/components/home/Hero";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import FreshOffTheRoad from "@/components/home/FreshOffTheRoad";
import WhyTravelWithMe from "@/components/home/WhyTravelWithMe";
import Testimonials from "@/components/home/Testimonials";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedBlogs />
      <FeaturedDestinations />
      <FreshOffTheRoad />
      <WhyTravelWithMe />
      <Testimonials />
    </>
  );
}
