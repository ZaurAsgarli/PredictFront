import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, Users, Trophy, Zap, ArrowRight } from 'lucide-react';
import EventCard from '../src/components/EventCard';
import { eventsService } from '../src/services/events';
import { authService } from '../src/services/auth';

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    loadFeaturedEvents();
  }, []);

  const loadFeaturedEvents = async () => {
    try {
      const data = await eventsService.getFeaturedEvents();
      setFeaturedEvents(data.slice(0, 3));
    } catch (error) {
      console.error('Error loading featured events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gray-800 text-white pt-32 pb-24 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gray-700/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8 animate-bounce-in">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white">
              Welcome to PredictHub
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Make predictions, compete with friends, and earn rewards in the ultimate prediction platform
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up">
                <Link
                  href="/signup"
                  className="group bg-white text-primary-600 px-10 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-large flex items-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <Link
                  href="/events"
                  className="group border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm flex items-center"
                >
                  Explore Events
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              Why PredictHub?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the future of prediction gaming with our innovative platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 border border-white/20 dark:border-gray-700/20 card-hover animate-slide-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-primary-500 to-blue-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Smart Predictions
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Use your knowledge and intuition to predict event outcomes with confidence levels and detailed analysis
              </p>
            </div>
            <div className="group text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 border border-white/20 dark:border-gray-700/20 card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-secondary-500 to-purple-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Community Driven
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Compete with others, share insights, and climb the leaderboard in our vibrant prediction community
              </p>
            </div>
            <div className="group text-center p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 border border-white/20 dark:border-gray-700/20 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-accent-500 to-pink-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Earn Rewards
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Win points, badges, and exclusive rewards for accurate predictions and consistent performance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12 animate-fade-in">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 gradient-text">
                Featured Events
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Discover trending prediction events</p>
            </div>
            <Link
              href="/events"
              className="group text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold flex items-center px-6 py-3 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
            >
              View All
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl shadow-soft h-96 animate-pulse"
                />
              ))}
            </div>
          ) : featuredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEvents.map((event, index) => (
                <div key={event.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Featured Events</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                No featured events available at the moment. Check back soon!
              </p>
              <Link
                href="/events"
                className="btn-primary"
              >
                Browse All Events
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 gradient-text">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started with PredictHub in just a few simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Browse Events',
                description: 'Explore upcoming events across various categories',
                icon: '🔍',
              },
              {
                step: '2',
                title: 'Make Predictions',
                description: 'Choose outcomes and set your confidence level',
                icon: '🎯',
              },
              {
                step: '3',
                title: 'Wait for Results',
                description: 'Events are resolved based on actual outcomes',
                icon: '⏳',
              },
              {
                step: '4',
                title: 'Earn Rewards',
                description: 'Gain points for correct predictions and climb ranks',
                icon: '🏆',
              },
            ].map((item, index) => (
              <div key={index} className="text-center group animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="relative mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-2xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300 shadow-large">
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-3xl opacity-80">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="relative py-24 bg-gray-800 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gray-700/20"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-gray-600/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-bounce-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-8">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Predicting?
              </h2>
              <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users making predictions and winning rewards in our vibrant community
              </p>
              <Link
                href="/signup"
                className="group inline-block bg-white text-primary-600 px-10 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-large"
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5 inline group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}