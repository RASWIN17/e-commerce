'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { SAMPLE_PRODUCTS, SAMPLE_COLLECTIONS, SAMPLE_REVIEWS } from '../lib/data/sampleProducts';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [heroSlide, setHeroSlide] = useState(1);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Filter 4 best sellers
  const bestSellers = SAMPLE_PRODUCTS.slice(0, 4);

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
      subtitle: 'Uncluttered silhouettes crafted in Tirupur, Tamil Nadu.',
      image: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1200&auto=format&fit=crop',
      alt: 'Portrait in warm natural fleece hoodie',
      ctaText: 'Explore Winter Drops',
      ctaLink: '/collections/hoodies-collection',
    },
  ];

  const currentHero = heroSlides[heroSlide - 1];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, subhead, CTA, carousel counter */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-8 pr-0 lg:pr-4">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171717] leading-[1.08]">
                {currentHero.title.split('feels like you.').length > 1 ? (
                  <>
                    Wear what <br />
                    feels like you.
                  </>
                ) : (
                  currentHero.title
                )}
              </h1>
              <p className="text-base sm:text-lg text-[#77736C] font-normal max-w-md">
                {currentHero.subtitle}
              </p>
            </div>

            <div>
              <Link
                href={currentHero.ctaLink}
                className="inline-flex items-center gap-2 bg-[#171717] text-white px-7 py-3.5 text-sm font-medium tracking-wide hover:bg-[#2A2A2A] transition-colors rounded-sm"
              >
                <span>{currentHero.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Slide Navigation: "01 / 03 < >" */}
            <div className="pt-6 flex items-center gap-6 text-xs text-[#77736C]">
              <span className="font-mono tracking-wider font-medium text-[#171717]">
                0{heroSlide} <span className="opacity-40">/</span> 0{heroSlides.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHeroSlide((prev) => (prev === 1 ? heroSlides.length : prev - 1))}
                  className="p-1.5 hover:text-[#171717] border border-[#E8E5DF] rounded-sm transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setHeroSlide((prev) => (prev === heroSlides.length ? 1 : prev + 1))}
                  className="p-1.5 hover:text-[#171717] border border-[#E8E5DF] rounded-sm transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Editorial Photo */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/3] bg-[#EFECE6] rounded-sm overflow-hidden shadow-card">
              <Image
                src={currentHero.image}
                alt={currentHero.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BEST SELLERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            Best Sellers
          </h2>
          <Link
            href="/shop"
            className="text-sm font-medium text-[#171717] hover:text-[#77736C] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Products in Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
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

        {/* 3 Collection Cards matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_COLLECTIONS.map((col) => (
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
              A lifestyle statement.
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

      {/* 5. CUSTOMER REVIEWS SECTION ("What Our Customers Say") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717]">
            What Our Customers Say
          </h2>
          <Link
            href="/reviews"
            className="text-sm font-medium text-[#171717] hover:text-[#77736C] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Review Card */}
          <div className="lg:col-span-7 border border-[#E8E5DF] bg-white p-6 sm:p-8 rounded-sm shadow-subtle space-y-4">
            <p className="text-sm sm:text-base text-[#171717] italic leading-relaxed">
              &quot;{SAMPLE_REVIEWS[reviewIndex].review_text}&quot;
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-xs font-bold text-[#171717]">
                {SAMPLE_REVIEWS[reviewIndex].user_name.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-semibold text-[#171717]">
                  {SAMPLE_REVIEWS[reviewIndex].user_name}
                </span>
                <span className="ml-2 text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  Verified Purchase
                </span>
              </div>
            </div>
          </div>

          {/* Dots in middle & carousel arrows */}
          <div className="lg:col-span-5 flex items-center justify-between lg:justify-end gap-6">
            <div className="flex items-center gap-1.5">
              {SAMPLE_REVIEWS.map((_, idx) => (
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
                  setReviewIndex((prev) => (prev === 0 ? SAMPLE_REVIEWS.length - 1 : prev - 1))
                }
                className="p-2 border border-[#E8E5DF] rounded-full hover:bg-white text-[#171717] transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setReviewIndex((prev) => (prev === SAMPLE_REVIEWS.length - 1 ? 0 : prev + 1))
                }
                className="p-2 border border-[#E8E5DF] rounded-full hover:bg-white text-[#171717] transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
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
              <span>Thank you for subscribing! Check your inbox for welcome perk.</span>
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

