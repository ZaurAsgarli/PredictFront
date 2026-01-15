import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles } from 'lucide-react';
import EventCard from '../src/components/EventCard';
import EventCardSkeleton from '../src/components/skeletons/EventCardSkeleton';
import FilterSkeleton from '../src/components/skeletons/FilterSkeleton';
import SEO from '../src/components/SEO';
import TrueFocus from '../src/components/TrueFocus';
import { eventsService } from '../src/services/events';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (cancelled) return;

      try {
        setLoading(true);
        console.log('[EventsPage] Fetching data ONCE on mount');
      
      // Add minimum loading time to ensure skeleton is visible
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 500));
      
      const [eventsData, categoriesData] = await Promise.all([
        eventsService.getAllEvents().catch((err) => {
          console.error('Error loading events:', err);
          console.error('Error URL:', err.config?.url);
          console.error('Error response:', err.response);
          return [];
        }),
        eventsService.getCategories().catch((err) => {
          console.error('Error loading categories:', err);
          return [];
        }),
      ]);
      
        // Wait for minimum load time if data loaded faster
        await minLoadTime;
        
        if (!cancelled) {
          console.log('Events page - Fetched events:', eventsData);
          console.log('Events page - Fetched categories:', categoriesData);
          setEvents(Array.isArray(eventsData) ? eventsData : []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading data:', error);
          setEvents([]);
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryName = typeof event.category === 'string' 
      ? event.category 
      : event.category?.name || '';
    const matchesCategory =
      selectedCategory === 'all' || categoryName === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || event.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://predicthub.com';
  
  // Structured data for events page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Prediction Events',
    description: 'Browse and make predictions on upcoming events',
    url: `${siteUrl}/events`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: events.length,
      itemListElement: events.slice(0, 10).map((event, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          name: event.title,
          description: event.description,
          url: `${siteUrl}/events/${event.id}`,
          startDate: event.ends_at,
        },
      })),
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-8"
    >
      <SEO
        title="Prediction Events"
        description="Browse and make predictions on upcoming events. Find active markets, filter by category, and start making predictions today."
        structuredData={structuredData}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 flex justify-center"
          >
            <div className="text-gray-900 dark:text-white">
              <TrueFocus
                sentence="Prediction Events"
                manualMode={false}
                blurAmount={8}
                borderColor="#3b82f6"
                glowColor="rgba(59, 130, 246, 0.6)"
                animationDuration={2}
                pauseBetweenAnimations={1}
              />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 dark:text-gray-400 text-lg text-center"
          >
            Browse and make predictions on upcoming events
          </motion.p>
        </motion.div>

        {/* Filters */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FilterSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative"
                >
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <motion.input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </motion.div>

                {/* Category Filter */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="relative"
                >
                  <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <motion.select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none transition-all"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </motion.select>
                </motion.div>

                {/* Status Filter */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <motion.select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="resolved">Resolved</option>
                  </motion.select>
                </motion.div>
              </div>

              {/* Results Count */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="mt-4 text-sm text-gray-600 dark:text-gray-400"
              >
                Showing <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredEvents.length}</span> of <span className="font-semibold">{events.length}</span> events
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Events Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <EventCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredEvents.length > 0 ? (
            <motion.div
              key="events"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  layout
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="mb-4"
              >
                <Search className="w-16 h-16 text-gray-400 mx-auto" />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-gray-500 dark:text-gray-400 text-lg"
              >
                No events found matching your criteria.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-gray-400 dark:text-gray-500 text-sm mt-2"
              >
                Try adjusting your filters or search terms
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

