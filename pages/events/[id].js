import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Users, TrendingUp, ArrowLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';
import PredictionForm from '../../src/components/PredictionForm';
import { eventsService } from '../../src/services/events';
import { predictionsService } from '../../src/services/predictions';
import { authService } from '../../src/services/auth';

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      const [eventData, predictionsData] = await Promise.all([
        eventsService.getEventById(id),
        predictionsService.getEventPredictions(id).catch(() => []),
      ]);
      setEvent(eventData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrediction = async (predictionData) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    try {
      await predictionsService.createPrediction({
        event: id,
        ...predictionData,
      });
      alert('Prediction submitted successfully!');
      setShowPredictionForm(false);
      loadEventData();
    } catch (error) {
      console.error('Error submitting prediction:', error);
      alert('Failed to submit prediction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-8" />
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl w-3/4 mb-4" />
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl">📅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event not found</h2>
            <p className="text-gray-500 dark:text-gray-400">The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-8 group animate-slide-up"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-medium">Back to Events</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            {event.image && (
              <div className="relative overflow-hidden rounded-2xl shadow-large animate-slide-up">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}

            {/* Event Details */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-white/20 dark:border-gray-700/20 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    event.status === 'active'
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-200'
                      : event.status === 'closed'
                      ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-200'
                      : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-200'
                  }`}
                >
                  {event.status.toUpperCase()}
                </span>
                {event.category && (
                  <span className="text-sm text-gray-600 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700 px-4 py-2 rounded-full font-medium">
                    {event.category}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 gradient-text">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">End Date</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {format(new Date(event.end_date), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gradient-to-r from-secondary-50 to-purple-50 dark:from-secondary-900/20 dark:to-purple-900/20 rounded-xl border border-secondary-100 dark:border-secondary-800/30">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Participants</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{event.participants_count || 0}</div>
                  </div>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Prediction Statistics */}
            {predictions.length > 0 && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-white/20 dark:border-gray-700/20 animate-slide-up">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 gradient-text">
                  Prediction Distribution
                </h2>
                <div className="space-y-6">
                  {event.options?.map((option, index) => {
                    const optionPredictions = predictions.filter(
                      (p) => p.outcome === option.id
                    );
                    const percentage =
                      predictions.length > 0
                        ? (optionPredictions.length / predictions.length) * 100
                        : 0;

                    return (
                      <div key={option.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900 dark:text-white text-lg">
                            {option.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              {optionPredictions.length} votes
                            </span>
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {event.status === 'active' && isAuthenticated ? (
              showPredictionForm ? (
                <PredictionForm
                  event={event}
                  onSubmit={handleSubmitPrediction}
                  loading={submitting}
                />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <button
                    onClick={() => setShowPredictionForm(true)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Make a Prediction
                  </button>
                </div>
              )
            ) : event.status === 'active' && !isAuthenticated ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Log in to make predictions
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Login to Predict
                </button>
              </div>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md p-6">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-center text-gray-600 dark:text-gray-400">
                  This event is {event.status}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

