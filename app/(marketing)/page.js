import Hero from "@/components/home/Hero";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import FeaturedBlogs from "@/components/home/FeaturedBlogs";
import WhyTravelWithMe from "@/components/home/WhyTravelWithMe";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedDestinations />
      <FeaturedBlogs />
      <WhyTravelWithMe />
      <Testimonials />
      <Newsletter />
    </>
  );
}
