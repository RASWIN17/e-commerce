'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Check, ShieldCheck, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCollections } from '../lib/catalog';
import { createClient } from '../lib/supabase/client';
import { Product, Collection } from '../lib/types';

export default function HomePage() {
  const [heroSlide, setHeroSlide] = useState(1);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cols] = await Promise.all([
          getProducts(),
          getCollections(),
        ]);
        setProducts(prods);
        setCollections(cols);

        // Fetch genuine approved reviews
        const supabase = createClient();
        const { data: revData } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(5);

        if (revData) {
          setReviews(revData);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const bestSellers = products.slice(0, 4);

  const heroSlides = [
    {
      id: 1,
      title: 'Wear what feels like you.',
      subtitle: 'Minimal. Comfortable. Timeless.',
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop',
      alt: 'Model wearing off-white oversized tee and sunglasses in sunlight',
      ctaText: 'Shop the Collection',
      ctaLink: '/shop',
    },
    {
      id: 2,
      title: 'Heavyweight. Bio-Washed. Pure.',
      subtitle: '240 GSM combed cotton built to retain shape for years.',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
      alt: 'Editorial flat lay of washed black organic graphic t-shirt',
      ctaText: 'Discover Essentials',
      ctaLink: '/collections/graphic-tees',
    },
    {
      id: 3,
      title: 'Tailored for the everyday nomad.',
      subtitle: 'Structured fleece hoodies, boxy cuts, and durable carry totes.',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop',
      alt: 'Oatmeal beige heavyweight studio hoodie flat lay',
      ctaText: 'Explore Hoodies',
      ctaLink: '/collections/hoodies-collection',
    },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      const supabase = createClient();
      await supabase.from('customer_feedback').insert({
        name: 'Newsletter Subscriber',
        email,
        subject: 'Newsletter Opt-In',
        message: 'Customer requested subscription to drops and new product alerts.',
        type: 'suggestion',
        status: 'new',
      });
      setSubscribed(true);
    } catch {
      setSubscribed(true);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SLIDER */}
      <section className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] max-h-[640px] bg-[#EFECE6] overflow-hidden">
        {heroSlides.map((slide) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              heroSlide === slide.id ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={slide.id === 1}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-12 lg:p-16">
              <div className="max-w-xl text-white space-y-2">
                <span className="text-xs uppercase tracking-widest font-medium text-white/80">
                  {slide.subtitle}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                  {slide.title}
                </h1>
                <div className="pt-4">
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 bg-white text-[#171717] px-6 py-3 text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-[#F7F6F2] transition-colors"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Hero Slider Dots */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
          {heroSlides.map((slide) => (
            <button
              key={slide.id}
              onClick={() => setHeroSlide(slide.id)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                heroSlide === slide.id ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${slide.id}`}
            />
          ))}
        </div>
      </section>

      {/* 2. BEST SELLERS / FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-[#77736C] mt-1">
              Top curated essentials crafted for everyday wear.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm font-medium text-[#171717] hover:text-[#77736C] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {bestSellers.length === 0 && !loading ? (
          <div className="py-12 text-center text-xs text-[#77736C]">
            Catalogue items loading from store repository...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 3. SHOP BY COLLECTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            Shop by Collection
          </h2>
          <Link
            href="/collections"
            className="text-sm font-medium text-[#171717] hover:text-[#77736C] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group relative aspect-[4/3] bg-[#EFECE6] rounded-sm overflow-hidden block"
            >
              <Image
                src={col.banner_url || ''}
                alt={col.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white tracking-wide">{col.name}</h3>
                <span className="text-xs font-medium text-white/90 flex items-center gap-1 mt-1 group-hover:underline">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. LIFESTYLE EDITORIAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EFECE6] rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="p-8 sm:p-12 lg:col-span-5 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight leading-snug">
              More than just clothing.
            </h2>
            <p className="text-sm sm:text-base text-[#77736C]">
              A lifestyle statement crafted with organic heavyweight fabrics and precise print engineering.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[#171717] text-white px-6 py-3 text-xs uppercase tracking-wider font-medium hover:bg-[#2A2A2A] transition-colors rounded-sm"
              >
                <span>Explore the Brand</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative aspect-[16/9] lg:aspect-auto lg:h-80 lg:col-span-7">
            <Image
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop"
              alt="Model relaxing in minimal IMAGIX t-shirt in warm sunlight"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 5. CRAFTSMANSHIP & VERIFIED FEEDBACK SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
              Customer Experiences & Brand Integrity
            </h2>
            <p className="text-xs sm:text-sm text-[#77736C] mt-1">
              Genuine feedback and certified manufacturing quality standards.
            </p>
          </div>
          <Link
            href="/reviews"
            className="text-sm font-medium text-[#171717] hover:text-[#77736C] flex items-center gap-1 transition-colors"
          >
            <span>Reviews policy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 border border-[#E8E5DF] bg-white p-6 sm:p-8 rounded-sm shadow-subtle space-y-4">
              <p className="text-sm sm:text-base text-[#171717] italic leading-relaxed">
                &quot;{reviews[reviewIndex].review_text}&quot;
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-xs font-bold text-[#171717]">
                  {reviews[reviewIndex].user_name.charAt(0)}
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#171717]">
                    {reviews[reviewIndex].user_name}
                  </span>
                  <span className="ml-2 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    Verified Purchase
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex items-center justify-between lg:justify-end gap-6">
              <div className="flex items-center gap-1.5">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReviewIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === reviewIndex ? 'bg-[#171717] w-4' : 'bg-[#D5D1C8]'
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setReviewIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1))
                  }
                  className="p-2 border border-[#E8E5DF] rounded-full hover:bg-white text-[#171717] transition-colors"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setReviewIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1))
                  }
                  className="p-2 border border-[#E8E5DF] rounded-full hover:bg-white text-[#171717] transition-colors"
                  aria-label="Next review"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5DF] p-6 sm:p-8 rounded-sm shadow-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#77736C]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#171717] font-semibold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>100% Genuine Reviews</span>
              </div>
              <p>
                We do not manufacture fake reviews or artificial ratings. Every published testimonial originates from customers with confirmed deliveries.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#171717] font-semibold text-sm">
                <Sparkles className="w-5 h-5 text-[#171717]" />
                <span>240 GSM Combed Jersey</span>
              </div>
              <p>
                Engineered for substantial, boxy drape and lasting wash stability using certified compact organic cotton.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#171717] font-semibold text-sm">
                <ArrowRight className="w-5 h-5 text-[#171717]" />
                <span>On-Demand Precision</span>
              </div>
              <p>
                Printed using high-definition, eco-friendly water-based inks that never crack or peel. Dispatched directly from Tirupur.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 6. NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EFECE6] rounded-sm p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-[#171717]">
              Join the club
            </h3>
            <p className="text-xs sm:text-sm text-[#77736C]">
              Get early access to new drops, exclusive offers and more.
            </p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100 px-5 py-3 rounded-sm">
              <Check className="w-4 h-4" />
              <span>Thank you for subscribing! Check your inbox for welcome perks.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 min-w-[240px] bg-white border border-[#D5D1C8] px-4 py-2.5 text-xs text-[#171717] focus:outline-none focus:border-[#171717] rounded-sm"
              />
              <button
                type="submit"
                className="bg-[#171717] text-white px-6 py-2.5 text-xs font-medium uppercase tracking-wider hover:bg-[#2A2A2A] transition-colors rounded-sm"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
