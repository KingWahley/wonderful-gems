import "./globals.css";

import { fetchSettings } from "@/lib/db";

export async function generateMetadata() {
  let seo = null;
  try {
    seo = await fetchSettings("home_seo");
  } catch (error) {
    console.error("Error fetching SEO settings", error);
  }

  const siteTitle = seo?.title || "The Long Way | Slow Travel Journal & Field Guides";
  const siteDesc = seo?.description || "A slow travel journal and bespoke consultancy curating deep, immersive travel experiences, field guides, and custom day-by-day itineraries for the curious traveler.";
  const siteImage = seo?.socialImage || "/images/logo.png";

  return {
    title: siteTitle,
    description: siteDesc,
    keywords: [
      "slow travel",
      "travel consultancy",
      "curated field guides",
      "travel journal",
      "custom travel itineraries",
      "luxury travel experiences",
      "boutique travel guide",
      "The Long Way travel"
    ],
    authors: [{ name: "Ava Wright" }],
    creator: "Ava Wright",
    publisher: "The Long Way",
    metadataBase: new URL("https://thelongway.travel"),
    alternatives: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/images/logo.png",
      shortcut: "/images/logo.png",
      apple: "/images/logo.png",
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: "https://thelongway.travel",
      siteName: "The Long Way",
      images: [
        {
          url: siteImage,
          width: 1200,
          height: 630,
          alt: "The Long Way - Slow Travel & Field Guides",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
      images: [siteImage],
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/images/logo.png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
