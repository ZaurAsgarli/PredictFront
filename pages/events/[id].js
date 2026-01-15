import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, TrendingUp, TrendingDown, Clock, DollarSign, HelpCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import SEO from '../../src/components/SEO';
import { eventsService } from '../../src/services/events';
import { predictionsService } from '../../src/services/predictions';
import { authService } from '../../src/services/auth';
import { toast } from 'react-toastify';
import SecurityAlertModal from '../../src/components/SecurityAlertModal';
import MarketTradeChart from '../../components/MarketTradeChart';

// Helper function to safely format dates
const safeFormatDate = (dateValue, formatStr = 'MMM dd, yyyy') => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, formatStr);
  } catch (error) {
    return 'N/A';
  }
};

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [securityReason, setSecurityReason] = useState('');
  const [tradeType, setTradeType] = useState('buy'); // 'buy' or 'sell'
  const [selectedOutcome, setSelectedOutcome] = useState('YES'); // 'YES' or 'NO'
  const [amount, setAmount] = useState('');
  const [chartTimeframe, setChartTimeframe] = useState('ALL'); // '1H', '6H', '1D', '1W', '1M', 'ALL'
  const [relatedMarkets, setRelatedMarkets] = useState([]);
  const [marketContext, setMarketContext] = useState('');
  const [generatingContext, setGeneratingContext] = useState(false);
  const [orderBookData, setOrderBookData] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [activeTab, setActiveTab] = useState('CHART'); // 'CHART', 'TRADES', 'INFO'
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (cancelled || !id) return;
      
      console.log(`[EventDetail] Fetching data ONCE for market ${id}`);
      
      // Load all data in parallel, but only once
      await Promise.all([
        loadEventData(),
        loadRelatedMarkets(),
        loadRecentTrades(),
        isAuthenticated ? loadUserProfile() : Promise.resolve()
      ]);
    }

    loadData();
    return () => { cancelled = true; };
  }, [id]); // Only depend on id, not chartTimeframe (that's for filtering only)

  const loadUserProfile = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    if (event && !cancelled) {
      if (event.description) {
        setMarketContext(event.description);
      }
      // Load order book after event data is available (mock data, no API call)
      const yesPriceValue = event.yes_price !== undefined ? parseFloat(event.yes_price) :
        (event._market?.prices?.yes_price ? parseFloat(event._market.prices.yes_price) : 0.5);
      loadOrderBook(yesPriceValue);
    }

    return () => { cancelled = true; };
  }, [event?.id, event?.yes_price]); // Only depend on primitive values, not the whole object


  const loadRecentTrades = async () => {
    try {
      const trades = await eventsService.getRecentTrades(id);
      setRecentTrades(trades);
    } catch (error) {
      console.error('Error loading recent trades:', error);
    }
  };

  const loadEventData = async () => {
    try {
      setLoading(true);
      const eventData = await eventsService.getEventById(id);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      // Set event to null to show error state
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedMarkets = async () => {
    try {
      const markets = await eventsService.getAllEvents({ limit: 5 });
      setRelatedMarkets(Array.isArray(markets) ? markets.filter(m => m.id !== parseInt(id)) : []);
    } catch (error) {
      console.error('Error loading related markets:', error);
    }
  };

  const loadOrderBook = (currentYesPrice) => {
    // Mock order book data - in production, fetch from API
    const basePrice = currentYesPrice || 0.5;
    const mockOrders = [
      { type: 'buy', price: parseFloat((basePrice + 0.01).toFixed(2)), amount: 150, total: parseFloat(((basePrice + 0.01) * 150).toFixed(2)) },
      { type: 'buy', price: parseFloat((basePrice + 0.02).toFixed(2)), amount: 200, total: parseFloat(((basePrice + 0.02) * 200).toFixed(2)) },
      { type: 'buy', price: parseFloat((basePrice + 0.03).toFixed(2)), amount: 100, total: parseFloat(((basePrice + 0.03) * 100).toFixed(2)) },
      { type: 'sell', price: parseFloat((basePrice - 0.01).toFixed(2)), amount: 120, total: parseFloat(((basePrice - 0.01) * 120).toFixed(2)) },
      { type: 'sell', price: parseFloat((basePrice - 0.02).toFixed(2)), amount: 180, total: parseFloat(((basePrice - 0.02) * 180).toFixed(2)) },
      { type: 'sell', price: parseFloat((basePrice - 0.03).toFixed(2)), amount: 90, total: parseFloat(((basePrice - 0.03) * 90).toFixed(2)) },
    ];
    setOrderBookData(mockOrders);
  };

  const quickAddAmount = (val) => {
    const current = parseFloat(amount || 0);
    const added = parseFloat(val);
    if (!isNaN(added)) {
      setAmount((current + added).toFixed(2));
    }
  };

  const handleGenerateContext = async () => {
    setGeneratingContext(true);
    try {
      // Simulate API call to generate context
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate context based on event data
      const generatedContext = `Market Analysis for "${event?.title}":
      
This prediction market evaluates the likelihood of the stated outcome. Current market sentiment indicates a ${yesProbability}% probability for "Yes" and ${noProbability}% for "No".

Key factors influencing this market:
- Market liquidity: $${event?.total_volume || 0}
- Current price: ${yesPrice}¢ (Yes) / ${noPrice}¢ (No)
- Market participants: ${event?.participants_count || 0} traders

${event?.description || 'This is a synthetic market created for testing and analysis purposes.'}

The market will resolve on ${safeFormatDate(event?.ends_at)}.`;

      setMarketContext(generatedContext);
    } catch (error) {
      console.error('Error generating context:', error);
      setMarketContext(event?.description || 'Failed to generate context. Please try again.');
    } finally {
      setGeneratingContext(false);
    }
  };

  const handleTrade = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const tradeAmount = parseFloat(amount);
    if (!amount || tradeAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure market_id is a number
      const marketId = parseInt(id, 10);
      if (isNaN(marketId)) {
        toast.error('Invalid market ID');
        setSubmitting(false);
        return;
      }

      await predictionsService.createPrediction({
        market_id: marketId,
        outcome_type: selectedOutcome,
        trade_type: tradeType,
        amount_staked: tradeAmount,
      });

      toast.success('Trade executed successfully!');
      setAmount('');

      // AUTO-REFRESH SPRINT 2
      await Promise.all([
        loadEventData(),
        loadRecentTrades(),
        loadUserProfile()
      ]);

    } catch (error) {
      console.error('Error executing trade:', error);

      // KILL SWITCH HANDLING SPRINT 2
      if (error.response?.status === 403) {
        const errorData = error.response?.data;
        const reason = errorData?.error || errorData?.detail || errorData?.message;
        setSecurityReason(reason);
        setShowSecurityAlert(true);
        return;
      }

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to execute trade. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate probability from prices
  // Event data may have prices directly or in a prices object
  const getYesPrice = () => {
    if (event?.yes_price !== undefined) return parseFloat(event.yes_price);
    if (event?._market?.prices?.yes_price !== undefined) return parseFloat(event._market.prices.yes_price);
    if (event?._market?.outcome_tokens) {
      const yesToken = event._market.outcome_tokens.find(t => t.outcome_type === 'YES');
      return yesToken?.price ? parseFloat(yesToken.price) : 0.5;
    }
    return 0.5;
  };

  const getNoPrice = () => {
    if (event?.no_price !== undefined) return parseFloat(event.no_price);
    if (event?._market?.prices?.no_price !== undefined) return parseFloat(event._market.prices.no_price);
    if (event?._market?.outcome_tokens) {
      const noToken = event._market.outcome_tokens.find(t => t.outcome_type === 'NO');
      return noToken?.price ? parseFloat(noToken.price) : 0.5;
    }
    return 0.5;
  };

  const yesPriceValue = getYesPrice();
  const noPriceValue = getNoPrice();
  const yesProbability = (yesPriceValue * 100).toFixed(0);
  const noProbability = (noPriceValue * 100).toFixed(0);
  const yesPrice = yesPriceValue.toFixed(2);
  const noPrice = noPriceValue.toFixed(2);

  // Calculate price change (mock data for now)
  const priceChange = useMemo(() => {
    return Math.random() * 20 - 10; // Random change between -10% and +10%
  }, [event]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-800 rounded-2xl mb-8" />
            <div className="h-8 bg-gray-800 rounded-xl w-3/4 mb-4" />
            <div className="h-4 bg-gray-800 rounded-lg w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Event not found</h2>
          <p className="text-gray-400">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://predicthub.com';

  // Structured data for event detail page
  const structuredData = event ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description || `Prediction market for: ${event.title}`,
    url: `${siteUrl}/events/${event.id}`,
    startDate: event.ends_at,
    endDate: event.ends_at,
    eventStatus: event.status === 'active' ? 'EventScheduled' : 'EventCancelled',
    organizer: {
      '@type': 'Organization',
      name: 'PredictHub',
      url: siteUrl,
    },
    offers: {
      '@type': 'Offer',
      price: yesPrice,
      priceCurrency: 'USD',
      availability: event.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
    },
  } : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {event && (
        <SEO
          title={event.title}
          description={event.description || `Make predictions on ${event.title}. Current probability: ${yesProbability}%`}
          url={`${siteUrl}/events/${event.id}`}
          type="article"
          structuredData={structuredData}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="flex items-center text-gray-400 hover:text-white mb-8 group transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Events</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Question */}
            <div className="flex items-start gap-4">
              {event.image && (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-700 shadow-lg"
                />
              )}
              <div className="space-y-4 flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {event.title}?
                </h1>

                {/* Market Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>${parseFloat(event.total_volume || 0).toLocaleString()} Vol.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{safeFormatDate(event.ends_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Probability Bar */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Current Probability</span>
                <span className="text-sm font-semibold text-blue-400">{yesProbability}% YES</span>
              </div>
              <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full transition-all duration-500"
                  style={{ width: `${yesProbability}%` }}
                />
                <div
                  className="bg-red-500 h-full transition-all duration-500"
                  style={{ width: `${noProbability}%` }}
                />
              </div>
            </div>

            {/* Activity Tabs */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="flex border-b border-gray-700">
                {['CHART', 'TRADES', 'INFO'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-bold transition-all ${activeTab === tab
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/10'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'CHART' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Trade Price History
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOutcome('YES')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            selectedOutcome === 'YES'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          YES
                        </button>
                        <button
                          onClick={() => setSelectedOutcome('NO')}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                            selectedOutcome === 'NO'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          NO
                        </button>
                      </div>
                    </div>
                    <MarketTradeChart 
                      marketId={id} 
                      selectedOutcome={selectedOutcome}
                      height={320}
                    />
                  </div>
                )}

                {activeTab === 'TRADES' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Recent Activity
                    </h3>
                    {recentTrades.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-700">
                              <th className="pb-3 font-medium">User</th>
                              <th className="pb-3 font-medium">Side</th>
                              <th className="pb-3 font-medium text-right">Amount</th>
                              <th className="pb-3 font-medium text-right">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentTrades.map((trade) => (
                              <tr key={trade.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                                <td className="py-4 text-xs text-blue-300">
                                  {trade.user?.username || 'Trader'}
                                </td>
                                <td className="py-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trade.outcome_type === 'YES' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                    }`}>
                                    {trade.outcome_type}
                                  </span>
                                </td>
                                <td className="py-4 text-right font-semibold text-white">
                                  ${parseFloat(trade.amount_staked).toLocaleString()}
                                </td>
                                <td className="py-4 text-right text-gray-500 text-xs">
                                  {new Date(trade.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No recent trades found.</p>
                    )}
                  </div>
                )}

                {activeTab === 'INFO' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">On-Chain Settlement</span>
                        <span className="text-xs font-bold text-green-400 uppercase">
                          {event.hasOnChainSettlement !== false ? 'Enabled' : 'Not Available'}
                        </span>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">Market Slug</span>
                        <code className="text-xs text-gray-300">{event._market?.slug || 'market-slug-placeholder'}</code>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">Network</span>
                        <span className="text-xs font-bold text-orange-400 uppercase">Ethereum Sepolia</span>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-500 block mb-1">Status</span>
                        <span className={`text-xs font-bold uppercase ${event.status === 'active' ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-gray-700 pl-4 py-2">
                      This market is synchronized with Polymarket Gamma API and secured by the Predator AI Defense Engine.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Book */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Order Book</h3>
                <HelpCircle className="w-5 h-5 text-gray-400 cursor-help" />
              </div>
              {orderBookData.length > 0 ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-400 mb-2 pb-2 border-b border-gray-700">
                    <div>Price</div>
                    <div>Amount</div>
                    <div>Total</div>
                  </div>
                  {/* Sell Orders (Red) */}
                  {orderBookData.filter(o => o.type === 'sell').reverse().map((order, idx) => (
                    <div key={`sell-${idx}`} className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-red-400">{order.price.toFixed(2)}¢</div>
                      <div className="text-gray-300">{order.amount}</div>
                      <div className="text-gray-300">${order.total.toFixed(2)}</div>
                    </div>
                  ))}
                  {/* Current Price Divider */}
                  <div className="grid grid-cols-3 gap-4 text-sm py-2 border-y border-gray-600 my-2">
                    <div className="font-semibold text-blue-400">{yesPrice}¢</div>
                    <div className="text-gray-400">Current</div>
                    <div className="text-gray-400">Price</div>
                  </div>
                  {/* Buy Orders (Green) */}
                  {orderBookData.filter(o => o.type === 'buy').map((order, idx) => (
                    <div key={`buy-${idx}`} className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-green-400">{order.price.toFixed(2)}¢</div>
                      <div className="text-gray-300">{order.amount}</div>
                      <div className="text-gray-300">${order.total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  No orders available
                </div>
              )}
            </div>

            {/* Market Context */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Market Context</h3>
                <button
                  onClick={handleGenerateContext}
                  disabled={generatingContext}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${generatingContext
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  {generatingContext ? 'Generating...' : 'Generate'}
                </button>
              </div>
              <div className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {marketContext || event.description || 'No additional context available for this market. Click Generate to create market analysis.'}
              </div>
            </div>

            {/* Rules */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Rules</h3>
              <a
                href={`/events/${event.id}`}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
              >
                View full market rules
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Trading Panel - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-8">
              {/* Buy/Sell Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${tradeType === 'buy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${tradeType === 'sell'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  Sell
                </button>
              </div>

              {/* Market Dropdown */}
              <div className="mb-6">
                <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  <option>Market</option>
                </select>
              </div>

              {/* YES/NO Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setSelectedOutcome('YES')}
                  className={`p-6 rounded-xl font-bold text-lg transition-all ${selectedOutcome === 'YES'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  <div className="text-2xl mb-1">Yes</div>
                  <div className="text-sm opacity-80">{yesPrice}¢</div>
                </button>
                <button
                  onClick={() => setSelectedOutcome('NO')}
                  className={`p-6 rounded-xl font-bold text-lg transition-all ${selectedOutcome === 'NO'
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                  <div className="text-2xl mb-1">No</div>
                  <div className="text-sm opacity-80">{noPrice}¢</div>
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-gray-400">Amount</label>
                </div>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Add Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                <button
                  onClick={() => quickAddAmount(1)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  +$1
                </button>
                <button
                  onClick={() => quickAddAmount(20)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  +$20
                </button>
                <button
                  onClick={() => quickAddAmount(100)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  +$100
                </button>
              </div>

              {/* Trade Button */}
              <button
                onClick={handleTrade}
                disabled={submitting || !amount}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${submitting || !amount
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
              >
                {submitting ? 'Processing...' : 'Trade'}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                By trading, you agree to the Terms of Use.
              </p>
            </div>

            {/* Related Markets */}
            {relatedMarkets.length > 0 && (
              <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Related Markets</h3>

                {/* Category Filters */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['All', 'Politics', 'Geopolitics', event.category].filter(Boolean).map((cat) => (
                    <button
                      key={cat}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${cat === event.category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      {typeof cat === 'string' ? cat : cat?.name || 'Uncategorized'}
                    </button>
                  ))}
                </div>

                {/* Related Markets List */}
                <div className="space-y-3">
                  {relatedMarkets.slice(0, 3).map((market) => (
                    <button
                      key={market.id}
                      onClick={() => router.push(`/events/${market.id}`)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                    >
                      {market.image && (
                        <img
                          src={market.image}
                          alt={market.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {market.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {market.yes_price ? (parseFloat(market.yes_price) * 100).toFixed(0) : '50'}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Alert Modal SPRINT 2 */}
      <SecurityAlertModal
        isOpen={showSecurityAlert}
        onClose={() => setShowSecurityAlert(false)}
        reason={securityReason}
      />
    </div>
  );
}
