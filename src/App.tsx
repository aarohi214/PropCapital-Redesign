import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bath,
  BedDouble,
  Bot,
  Check,
  ChevronDown,
  Compass,
  Globe2,
  Heart,
  Instagram,
  Layers3,
  Linkedin,
  Mail,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';

type Category = 'Buy' | 'Rent' | 'Invest';
type ModalKind = 'explore' | 'property' | null;
type Property = {
  id: number;
  title: string;
  location: string;
  type: string;
  price: string;
  detail: string;
  beds: string;
  baths: string;
  area: string;
  image: string;
};

type Location = { name: string; label: string; description: string; image: string; number: string };
type ChatMessage = { role: 'user' | 'assistant'; text: string };

const properties: Property[] = [
  { id: 1, title: 'The Grove Residences', location: 'Golf Course Road, Gurgaon', type: 'Contemporary residence', price: '₹3.85 Cr', detail: 'Quiet luxury with a private garden and panoramic city views.', beds: '3 beds', baths: '3 baths', area: '2,450 sq ft', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=88' },
  { id: 2, title: 'Atria House', location: 'Sector 150, Noida', type: 'Sky villa', price: '₹2.15 Cr', detail: 'Light-filled interiors, a generous terrace and a slower rhythm.', beds: '4 beds', baths: '4 baths', area: '3,180 sq ft', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=88' },
  { id: 3, title: 'Vasant Kunj Courtyard', location: 'Vasant Kunj, New Delhi', type: 'Garden apartment', price: '₹1.72 Cr', detail: 'A modern courtyard home woven into an established neighbourhood.', beds: '3 beds', baths: '2 baths', area: '1,960 sq ft', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88' },
  { id: 4, title: 'Aria at Central Park', location: 'Sector 48, Gurgaon', type: 'Investment opportunity', price: '₹98 Lakh', detail: 'High-demand micro-market with strong rental fundamentals.', beds: '2 beds', baths: '2 baths', area: '1,240 sq ft', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=88' },
];

const locations: Location[] = [
  { name: 'Gurgaon', label: 'The new city centre', description: 'A high-energy mix of business districts, green escapes and considered new communities.', number: '01', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=88' },
  { name: 'Noida', label: 'Built for tomorrow', description: 'More space, new infrastructure and a market with room to grow into its next chapter.', number: '02', image: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=88' },
  { name: 'New Delhi', label: 'Where legacy lives', description: 'Established neighbourhoods, enduring architecture and a slower, more rooted rhythm.', number: '03', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=88' },
];

const navItems = ['Explore', 'Buy', 'Sell', 'Invest', 'Insights'];
const categories: Category[] = ['Buy', 'Rent', 'Invest'];
const searchSuggestions = ['A sunlit 3 BHK in Gurgaon', 'RERA-verified plots in Noida', 'An investment under ₹2 Cr'];

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('Buy');
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState('Gurgaon');
  const [savedProperties, setSavedProperties] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [propertyOffset, setPropertyOffset] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('Based on your brief, I’d start with Sector 150, Noida and New Gurgaon. Both offer a strong balance of connectivity, liveability and long-term potential.');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollableHeight > 0 ? Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100)) : 0);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalKind(null);
        setActiveProperty(null);
        setIsChatOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeModal = () => {
    setModalKind(null);
    setActiveProperty(null);
  };

  const handleSearch = (value = searchText) => {
    if (!value.trim()) {
      setSearchMessage('Tell us what you are looking for to get started.');
      return;
    }
    setSearchMessage(`We found a few promising ${activeCategory.toLowerCase()} directions for “${value}”.`);
  };

  const askAi = (prompt: string) => {
    setAiPrompt(prompt);
    const responses: Record<string, string> = {
      'Compare Sector 150 and New Gurgaon': 'Sector 150 leans toward open space and newer infrastructure. New Gurgaon offers stronger rental depth and faster access to the business districts.',
      'Show me 3 BHK homes': 'I’d shortlist sunlit 3 BHKs in Golf Course Extension, Sector 150 and Vasant Kunj. Want to set a budget range?',
      'Find a home near good schools': 'Gurgaon’s Golf Course Road and South Delhi’s Vasant Kunj are strong places to begin if everyday convenience is the priority.',
      'What is growing in Noida?': 'Sector 150 and the Noida-Greater Noida Expressway are seeing the clearest mix of new communities, infrastructure and investor interest.',
      'Help me compare Gurgaon markets': 'Golf Course Road is established and premium. New Gurgaon is more spacious and still evolving. Sector 48 is the balanced middle ground.',
      'Find a 3 BHK in Gurgaon': 'I’d shortlist sunlit 3 BHKs in Golf Course Extension and Sector 48, where you get strong access to schools, offices and everyday amenities.',
      'Explore investment opportunities in Noida': 'Sector 150 and the Noida-Greater Noida Expressway are showing the clearest mix of new communities, infrastructure and investor interest.',
      'Compare Delhi property prices': 'South Delhi remains the premium benchmark. Vasant Kunj gives you more space for the same budget, while central neighbourhoods carry a stronger legacy premium.',
    };
    const response = responses[prompt] ?? 'That is a thoughtful brief. Tell me your preferred city, budget and timeline, and I’ll shape a sharper starting point.';
    setAiResponse(response);
    return response;
  };

  const toggleSaved = (id: number) => {
    setSavedProperties((current) => current.includes(id) ? current.filter((propertyId) => propertyId !== id) : [...current, id]);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const visibleProperties = properties.map((_, index) => properties[(index + propertyOffset) % properties.length]);

  return (
    <div className="app-shell">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />
      <motion.header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`} animate={{ y: 0 }} transition={{ duration: .35 }}>
        <div className="header-inner">
          <button className="brand" onClick={() => scrollToSection('top')} aria-label="Go to top"><span className="brand-mark">PC</span><span className="brand-name">PropCapital<span>.ai</span></span></button>
          <nav className={`desktop-nav ${isMobileMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            {navItems.map((item) => <button className="nav-link" key={item} onClick={() => scrollToSection(item === 'Explore' ? 'featured' : item === 'Insights' ? 'insights' : item === 'Invest' ? 'ai-experience' : 'why')}>{item}{(item === 'Buy' || item === 'Invest') && <ChevronDown size={13} strokeWidth={1.8} />}</button>)}
          </nav>
          <div className="header-actions"><button className="header-login" onClick={() => setModalKind('explore')}>Sign in</button><button className="header-cta" onClick={() => setModalKind('explore')}>Explore properties <ArrowUpRight size={16} /></button><button className="mobile-menu-button" onClick={() => setIsMobileMenuOpen((open) => !open)} aria-label="Toggle menu">{isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
        </div>
      </motion.header>

      <main id="top">
        <section className="hero-section">
          <motion.img className="hero-photo" src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2400&q=92" alt="Warm contemporary home overlooking a landscape" initial={{ scale: 1.12 }} animate={{ scale: 1.02 }} transition={{ duration: 18, ease: 'easeOut' }} />
          <div className="hero-overlay" />
          <div className="hero-grain" />
          <div className="hero-content page-width">
            <motion.div className="hero-copy" initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div className="eyebrow eyebrow-light" variants={fadeUp}><span className="eyebrow-dot" /> NCR REAL ESTATE, REIMAGINED</motion.div>
              <motion.h1 variants={fadeUp}>Find a place.<br /><em>Build your future.</em></motion.h1>
              <motion.p variants={fadeUp}>Discover properties, opportunities and smarter real estate decisions across NCR — powered by intelligence.</motion.p>
              <motion.div className="hero-status-row" variants={fadeUp}><span><i className="live-dot" /> AI-powered discovery</span><span>250+ opportunities</span></motion.div>
            </motion.div>
            <motion.button className="hero-property-card" onClick={() => { setActiveProperty(properties[0]); setModalKind('property'); }} initial={{ opacity: 0, x: 38, y: 16 }} animate={{ opacity: 1, x: 0, y: [0, -9, 0] }} transition={{ opacity: { duration: .7, delay: .45 }, x: { duration: .7, delay: .45 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 } }}>
              <div className="hero-property-image"><img src={properties[0].image} alt={properties[0].title} /><span>PROP CAPITAL PICK</span></div>
              <div className="hero-property-info"><div><small>Golf Course Road, Gurgaon</small><strong>The Grove Residences</strong><span>Contemporary residence · {properties[0].price}</span></div><ArrowUpRight size={18} /></div>
            </motion.button>
            <motion.div className="hero-search-wrap" initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .32, ease: 'easeOut' }}>
              <div className="ai-label"><Sparkles size={14} /> AI property discovery</div>
              <div className="hero-search-panel"><div className="search-input-row"><Search size={19} /><input value={searchText} onChange={(event) => { setSearchText(event.target.value); setSearchMessage(''); }} onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }} placeholder="Describe the property you’re looking for..." aria-label="Describe the property you are looking for" /><button className="search-filter" aria-label="Open search filters"><SlidersHorizontal size={17} /></button><button className="search-submit" onClick={() => handleSearch()}>Search <ArrowUpRight size={16} /></button></div><div className="search-controls"><div className="category-tabs" role="tablist" aria-label="Property purpose">{categories.map((category) => <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}</button>)}</div><div className="location-select"><MapPin size={14} /><span>Across NCR</span><ChevronDown size={14} /></div></div>{searchMessage && <motion.div className="search-feedback" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}><Check size={14} /> {searchMessage}</motion.div>}</div>
              <div className="suggestion-row"><span>Try asking</span>{searchSuggestions.map((suggestion) => <button key={suggestion} onClick={() => { setSearchText(suggestion); handleSearch(suggestion); }}>{suggestion}</button>)}</div>
            </motion.div>
          </div>
          <div className="hero-edge-note"><span>01</span><span className="edge-line" /><span>CURATED FOR NCR</span></div>
          <div className="scroll-cue"><span className="scroll-line" /> Scroll to explore</div>
        </section>

        <section className="intro-section page-width section-space"><Reveal className="section-intro split-intro"><div><div className="eyebrow"><span className="eyebrow-dot" /> THE PROPCAPITAL DIFFERENCE</div><h2>Clarity for every<br /><em>move you make.</em></h2></div><p>We bring the human instinct of a great advisor together with the signal of intelligent data — so your next property decision feels considered, not complicated.</p></Reveal><div className="stats-row"><Stat value={250} suffix="+" label="Property opportunities" detail="Curated across NCR" /><Stat value={3} suffix="" label="NCR markets" detail="Gurgaon · Noida · Delhi" /><Stat value={98} suffix="%" label="Verified network" detail="Built on trust" /></div></section>

        <EditorialMarquee />

        <section className="featured-section page-width section-space" id="featured"><Reveal className="section-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> A CONSIDERED SELECTION</div><h2>Properties worth<br /><em>looking twice at.</em></h2></div><div className="carousel-actions"><button onClick={() => setPropertyOffset((offset) => (offset + properties.length - 1) % properties.length)} aria-label="Previous properties"><ArrowLeft size={18} /></button><button onClick={() => setPropertyOffset((offset) => (offset + 1) % properties.length)} aria-label="Next properties"><ArrowRight size={18} /></button></div></Reveal><div className="property-editorial"><PropertyShowcase key={`lead-${visibleProperties[0].id}`} property={visibleProperties[0]} large saved={savedProperties.includes(visibleProperties[0].id)} onSave={() => toggleSaved(visibleProperties[0].id)} onOpen={() => { setActiveProperty(visibleProperties[0]); setModalKind('property'); }} /><div className="property-side-column"><PropertyShowcase key={`side-${visibleProperties[1].id}`} property={visibleProperties[1]} saved={savedProperties.includes(visibleProperties[1].id)} onSave={() => toggleSaved(visibleProperties[1].id)} onOpen={() => { setActiveProperty(visibleProperties[1]); setModalKind('property'); }} /><PropertyShowcase key={`compact-${visibleProperties[2].id}`} property={visibleProperties[2]} compact saved={savedProperties.includes(visibleProperties[2].id)} onSave={() => toggleSaved(visibleProperties[2].id)} onOpen={() => { setActiveProperty(visibleProperties[2]); setModalKind('property'); }} /></div></div><div className="carousel-footer"><span>0{propertyOffset + 1} — 04</span><div className="carousel-progress"><span style={{ width: `${((propertyOffset + 1) / properties.length) * 100}%` }} /></div><button onClick={() => setModalKind('explore')}>View all properties <ArrowUpRight size={15} /></button></div></section>

        <LocationExplorer locations={locations} selectedLocation={selectedLocation} onSelect={setSelectedLocation} properties={properties} onOpenProperty={(property) => { setActiveProperty(property); setModalKind('property'); }} />

        <section className="why-section page-width section-space" id="why"><Reveal className="why-visual"><div className="why-frame"><img src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=88" alt="Geometric modern building facade" /><div className="why-image-overlay" /><div className="why-note"><Sparkles size={14} /> Intelligence, with intuition.</div></div><span className="vertical-label">HOW WE THINK</span></Reveal><Reveal className="why-copy"><div className="eyebrow"><span className="eyebrow-dot" /> MORE THAN A LISTING</div><h2>Property search,<br /><em>reimagined.</em></h2><p>Good property decisions are about more than square feet. Our platform helps you read the finer details — the people, patterns and potential behind every opportunity.</p><div className="feature-list"><Feature icon={<Compass size={19} />} title="Smarter discovery" text="Start with a feeling, a budget or a future plan. We make the search feel natural." /><Feature icon={<ShieldCheck size={19} />} title="Verified by design" text="Every opportunity is filtered through a network that values transparency." /><Feature icon={<BarChart3 size={19} />} title="Signal over noise" text="See the market clearly with insights built around how NCR is actually moving." /></div><button className="text-button" onClick={() => scrollToSection('ai-experience')}>See how it works <ArrowUpRight size={16} /></button></Reveal></section>

        <section className="ai-section" id="ai-experience"><div className="ai-image-layer"><img src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1800&q=88" alt="Editorial apartment interior" /><div /></div><div className="page-width ai-layout"><Reveal className="ai-copy"><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> YOUR DIGITAL PROPERTY ADVISOR</div><h2>Ask better.<br /><em>Move smarter.</em></h2><p>Have a thought? Start there. PropCapital turns natural questions into a clearer view of your next move.</p><button className="light-button" onClick={() => setIsChatOpen(true)}>Talk to PropCapital <MessageCircle size={17} /></button></Reveal><Reveal className="ai-window"><div className="ai-window-header"><div className="ai-identity"><span className="ai-avatar"><Sparkles size={15} /></span><span><strong>PropCapital AI</strong><small>Online · ready to help</small></span></div><span className="window-dots"><i /><i /><i /></span></div><div className="chat-body"><motion.div className="chat-message user-message" key={aiPrompt || 'default-user'} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>I want an investment property in NCR under ₹2 crore.</motion.div><motion.div className="chat-message ai-message" key={aiResponse} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .12 }}><span className="tiny-spark"><Sparkles size={12} /></span><div>{aiResponse}</div></motion.div><div className="chat-suggestion"><button onClick={() => askAi('Compare Sector 150 and New Gurgaon')}><Layers3 size={13} /> Compare markets</button><button onClick={() => askAi('Show me 3 BHK homes')}><Search size={13} /> Refine my brief</button></div></div><div className="chat-composer"><span>{aiPrompt || 'Ask anything about NCR real estate...'}</span><button onClick={() => setIsChatOpen(true)} aria-label="Open chat"><Send size={16} /></button></div></Reveal></div></section>

        <section className="insights-section page-width section-space" id="insights"><Reveal className="section-heading-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> FROM THE FIELD</div><h2>Read the market<br /><em>with fresh eyes.</em></h2></div><button className="text-button" onClick={() => setModalKind('explore')}>View all insights <ArrowUpRight size={16} /></button></Reveal><Reveal className="insight-feature"><div className="insight-art"><img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=88" alt="Light-filled luxury living room" /><div /></div><div className="insight-content"><span>MARKET NOTE · 06 MIN READ</span><h3>Why New Gurgaon is becoming the NCR’s most interesting next chapter.</h3><button onClick={() => setModalKind('explore')}>Read story <ArrowUpRight size={15} /></button></div></Reveal></section>

        <section className="final-cta-section page-width"><img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90" alt="Minimalist luxury apartment interior" /><div className="final-cta-overlay" /><div className="final-cta-copy"><div className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> THE NEXT CHAPTER STARTS HERE</div><h2>Make your next<br /><em>move meaningful.</em></h2><p>Tell us what you’re looking for. We’ll help you see what’s possible.</p><button className="light-button" onClick={() => setModalKind('explore')}>Begin your search <ArrowUpRight size={17} /></button></div></section>
      </main>

      <footer className="site-footer"><div className="page-width"><div className="footer-top"><div className="footer-brand"><button className="brand brand-footer" onClick={() => scrollToSection('top')}><span className="brand-mark">PC</span><span className="brand-name">PropCapital<span>.ai</span></span></button><p>A clearer way to find your place<br />in the world.</p><div className="social-row"><a href="#top" aria-label="Instagram"><Instagram size={17} /></a><a href="#top" aria-label="LinkedIn"><Linkedin size={17} /></a><a href="#top" aria-label="Website"><Globe2 size={17} /></a></div></div><div className="footer-links"><div><span>Explore</span><button onClick={() => scrollToSection('featured')}>Featured properties</button><button onClick={() => scrollToSection('markets')}>NCR markets</button><button onClick={() => scrollToSection('ai-experience')}>AI discovery</button></div><div><span>Company</span><button onClick={() => scrollToSection('why')}>Our approach</button><button onClick={() => setModalKind('explore')}>Partner with us</button><button onClick={() => setModalKind('explore')}>Insights</button></div><div><span>Get in touch</span><a href="mailto:hello@propcapital.ai"><Mail size={14} /> hello@propcapital.ai</a><a href="tel:+911140000000"><Phone size={14} /> +91 11 4000 0000</a><span className="footer-location"><MapPin size={14} /> New Delhi, India</span></div></div></div><div className="footer-bottom"><span>© 2026 PropCapital.ai</span><span>Built for considered moves.</span><div><button onClick={() => setModalKind('explore')}>Privacy</button><button onClick={() => setModalKind('explore')}>Terms</button></div></div></div></footer>

      <AnimatePresence>{modalKind && <Modal onClose={closeModal}>{modalKind === 'explore' ? <ExploreModal activeCategory={activeCategory} setActiveCategory={setActiveCategory} searchText={searchText} setSearchText={setSearchText} onSearch={handleSearch} searchMessage={searchMessage} properties={properties} onOpenProperty={(property) => { setActiveProperty(property); setModalKind('property'); }} /> : activeProperty ? <PropertyModal property={activeProperty} onSave={() => toggleSaved(activeProperty.id)} isSaved={savedProperties.includes(activeProperty.id)} /> : null}</Modal>}</AnimatePresence>
      <AnimatePresence>{isChatOpen && <ChatDrawer onClose={() => setIsChatOpen(false)} askAi={askAi} />}</AnimatePresence>
      <button className={`assistant-fab ${isChatOpen ? 'is-open' : ''}`} onClick={() => setIsChatOpen((open) => !open)} aria-label="Open AI assistant"><span><Sparkles size={18} /></span><strong>Ask PropCapital</strong><small>AI property guide</small></button>
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: .7, ease: 'easeOut' } } } as const;
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: .12 } } };

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  return <motion.div className={className} initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }} whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true, amount: .16 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: .68, ease: 'easeOut' }}>{children}</motion.div>;
}

function Stat({ value, suffix, label, detail }: { value: number; suffix: string; label: string; detail: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: .7 });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let frame = 0;
    const timer = window.setInterval(() => { frame += 1; setCount(Math.min(value, Math.round((value * frame) / 28))); if (frame >= 28) window.clearInterval(timer); }, 32);
    return () => window.clearInterval(timer);
  }, [isInView, value]);
  return <div className="stat" ref={ref}><strong>{count}{suffix}</strong><span>{label}</span><small>{detail}</small></div>;
}

function PropertyShowcase({ property, large = false, compact = false, saved, onSave, onOpen }: { property: Property; large?: boolean; compact?: boolean; saved: boolean; onSave: () => void; onOpen: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  return <motion.article layout initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={shouldReduceMotion ? { duration: 0 } : { duration: .45 }} className={`showcase-property ${large ? 'is-large' : ''} ${compact ? 'is-compact' : ''}`}><button className="showcase-image" onClick={onOpen} aria-label={`View ${property.title}`}><img src={property.image} alt={property.title} /><div className="image-shade" /><span className="image-index">0{property.id}</span><span className="view-overlay">View property <ArrowUpRight size={16} /></span></button><button className={`save-button ${saved ? 'is-saved' : ''}`} onClick={onSave} aria-label={saved ? 'Remove saved property' : 'Save property'}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button><div className="showcase-copy"><div className="property-meta"><span>{property.type}</span><span>{property.price}</span></div><h3>{property.title}</h3><p><MapPin size={14} /> {property.location}</p><div className="property-facts"><span><BedDouble size={15} /> {property.beds}</span><span><Bath size={15} /> {property.baths}</span><span><Maximize2 size={14} /> {property.area}</span></div></div></motion.article>;
}

function LocationExplorer({ locations, selectedLocation, onSelect, properties, onOpenProperty }: { locations: Location[]; selectedLocation: string; onSelect: (name: string) => void; properties: Property[]; onOpenProperty: (property: Property) => void }) {
  const selected = locations.find((location) => location.name === selectedLocation) ?? locations[0];
  const locationProperties = properties.filter((property) => selected.name === 'Gurgaon' ? property.location.includes('Gurgaon') : selected.name === 'Noida' ? property.location.includes('Noida') : property.location.includes('New Delhi'));
  return <section className="markets-section section-space" id="markets"><div className="page-width"><Reveal className="section-heading-row market-heading"><div><div className="eyebrow"><span className="eyebrow-dot" /> KNOW YOUR MARKET</div><h2>Three cities.<br /><em>One clear view.</em></h2></div><p>Move between NCR’s most interesting markets and see the kind of properties, rhythms and opportunities each one holds.</p></Reveal><div className="location-explorer"><div className="market-grid">{locations.map((location, index) => <motion.button className={`market-tile market-tile-${index} ${selected.name === location.name ? 'is-selected' : ''}`} key={location.name} onClick={() => onSelect(location.name)} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ delay: index * .1, duration: .6 }} whileHover={{ y: -8 }} aria-pressed={selected.name === location.name}><img src={location.image} alt={`${location.name} architecture`} /><div className="market-overlay" /><div className="market-copy"><span>{location.number}</span><div><h3>{location.name}</h3><p>{location.label}</p></div><ArrowUpRight size={19} /></div></motion.button>)}</div><AnimatePresence mode="wait"><motion.aside className="location-detail" key={selected.name} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: .35 }}><div className="location-detail-image"><img src={selected.image} alt={`${selected.name} selected market`} /><div /></div><div className="location-detail-top"><span className="eyebrow"><span className="eyebrow-dot" /> SELECTED MARKET</span><span className="location-count">{selected.number} / 03</span></div><h3>{selected.name}</h3><p>{selected.description}</p><div className="location-preview-list">{locationProperties.length ? locationProperties.slice(0, 2).map((property) => <button className="location-preview" key={property.id} onClick={() => onOpenProperty(property)}><img src={property.image} alt={property.title} /><span><small>{property.type}</small><strong>{property.title}</strong><em>{property.price}</em></span><ArrowUpRight size={16} /></button>) : <p className="location-empty">Curating the first opportunities for this market.</p>}</div><button className="location-explore-button" onClick={() => locationProperties[0] && onOpenProperty(locationProperties[0])}>Explore {selected.name} <ArrowUpRight size={15} /></button></motion.aside></AnimatePresence></div></div></section>;
}

function EditorialMarquee() {
  const message = 'FIND YOUR PLACE  •  DISCOVER OPPORTUNITY  •  INVEST SMARTER  •  LIVE BETTER  •  ';
  return <section className="editorial-marquee" aria-label="PropCapital principles"><div className="marquee-track"><span>{message}</span><span aria-hidden="true">{message}</span></div></section>;
}

function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="feature-item"><span className="feature-icon">{icon}</span><div><h3>{title}</h3><p>{text}</p></div><ArrowUpRight size={16} /></div>;
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><motion.div className="modal-card" initial={{ opacity: 0, y: 22, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 22, scale: .97 }} transition={{ duration: .25 }}><button className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>{children}</motion.div></motion.div>;
}

function ExploreModal({ activeCategory, setActiveCategory, searchText, setSearchText, onSearch, searchMessage, properties, onOpenProperty }: { activeCategory: Category; setActiveCategory: (category: Category) => void; searchText: string; setSearchText: (value: string) => void; onSearch: () => void; searchMessage: string; properties: Property[]; onOpenProperty: (property: Property) => void }) {
  return <div className="explore-modal"><div className="modal-kicker"><Sparkles size={15} /> PERSONALIZED DISCOVERY</div><h2>Let’s find your<br /><em>next place.</em></h2><p>Share a little about what you want. We’ll help you make sense of the possibilities.</p><div className="modal-tabs">{categories.map((category) => <button className={activeCategory === category ? 'active' : ''} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="modal-search"><Search size={18} /><input autoFocus value={searchText} onChange={(event) => setSearchText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onSearch(); }} placeholder="e.g. A quiet 3 BHK near Golf Course Road" /><button onClick={onSearch}>Begin <ArrowUpRight size={16} /></button></div>{searchMessage && <div className="modal-feedback"><Check size={15} /> {searchMessage}</div>}<div className="modal-preview-row">{properties.slice(0, 3).map((property) => <button key={property.id} onClick={() => onOpenProperty(property)}><img src={property.image} alt={property.title} /><span>{property.title}</span></button>)}</div><div className="modal-footnote"><ShieldCheck size={15} /> No pressure, no noise. Just a clearer starting point.</div></div>;
}

function PropertyModal({ property, onSave, isSaved }: { property: Property; onSave: () => void; isSaved: boolean }) {
  const [isEnquirySent, setIsEnquirySent] = useState(false);
  return <div className="property-modal"><div className="property-modal-image"><img src={property.image} alt={property.title} /><div /><span>PROP CAPITAL PICK</span></div><div className="property-modal-copy"><div className="property-meta"><span>{property.type}</span><span>{property.price}</span></div><h2>{property.title}</h2><p className="modal-location"><MapPin size={15} /> {property.location}</p><p>{property.detail}</p><div className="modal-facts"><span><BedDouble size={16} /> {property.beds}</span><span><Bath size={16} /> {property.baths}</span><span><Maximize2 size={15} /> {property.area}</span></div><div className="property-modal-actions"><button className="dark-button" onClick={() => setIsEnquirySent(true)}>{isEnquirySent ? 'Enquiry noted' : 'Request a private viewing'} <ArrowUpRight size={16} /></button><button className={`round-save ${isSaved ? 'is-saved' : ''}`} onClick={onSave} aria-label="Save property"><Heart size={17} fill={isSaved ? 'currentColor' : 'none'} /></button></div>{isEnquirySent && <p className="enquiry-confirmation"><Check size={14} /> We’ll be in touch about {property.title}.</p>}</div></div>;
}

function ChatDrawer({ onClose, askAi }: { onClose: () => void; askAi: (prompt: string) => string }) {
  const prompts = ['Find a 3 BHK in Gurgaon', 'Explore investment opportunities in Noida', 'Compare Delhi property prices'];
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', text: 'Welcome to PropCapital. Ask me about a neighbourhood, a budget or your next property move.' }]);
  const handleSend = (value = input) => {
    const prompt = value.trim();
    if (!prompt) return;
    const response = askAi(prompt);
    setMessages((current) => [...current, { role: 'user', text: prompt }, { role: 'assistant', text: response }]);
    setInput('');
  };
  return <motion.aside className="chat-panel" initial={{ opacity: 0, x: 30, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0, x: 30, y: 20 }}><div className="chat-panel-head"><div className="ai-identity"><span className="ai-avatar"><Sparkles size={15} /></span><span><strong>PropCapital AI</strong><small>Your property companion</small></span></div><button onClick={onClose} aria-label="Close assistant"><X size={18} /></button></div><div className="chat-panel-body"><div className="chat-panel-welcome"><span className="ai-avatar large"><Bot size={18} /></span><strong>What are you curious about?</strong><p>Ask me about a neighbourhood, a budget or a property goal.</p></div><div className="drawer-messages">{messages.map((message, index) => <div className={`drawer-message ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>)}</div><div className="panel-prompts">{prompts.map((prompt, index) => <button key={prompt} onClick={() => handleSend(prompt)}><span>0{index + 1}</span>{prompt}<ArrowUpRight size={14} /></button>)}</div></div><form className="chat-panel-input" onSubmit={(event) => { event.preventDefault(); handleSend(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Type your question..." aria-label="Type your question" /><button type="submit" aria-label="Send question"><Send size={16} /></button></form></motion.aside>;
}

export default App;
