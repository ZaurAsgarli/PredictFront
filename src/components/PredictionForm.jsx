import { useState } from 'react';
import { TrendingUp, AlertCircle, Target, DollarSign, MessageSquare, CheckCircle } from 'lucide-react';

export default function PredictionForm({ event, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    outcome: '',
    confidence: 50,
    stake: 10,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.outcome) {
      newErrors.outcome = 'Please select an outcome';
    }
    if (formData.confidence < 1 || formData.confidence > 100) {
      newErrors.confidence = 'Confidence must be between 1 and 100';
    }
    if (formData.stake < 1) {
      newErrors.stake = 'Stake must be at least 1';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-soft p-8 border border-white/20 dark:border-gray-700/20 animate-bounce-in">
      <div className="flex items-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mr-4">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white gradient-text">
            Make Your Prediction
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Choose your outcome and set your confidence</p>
        </div>
      </div>

      {/* Outcome Selection */}
      <div className="mb-8">
        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          <Target className="h-4 w-4 mr-2 text-primary-600" />
          Select Outcome *
        </label>
        <div className="space-y-3">
          {event.options?.map((option, index) => (
            <div
              key={option.id}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 group ${
                formData.outcome === option.id
                  ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 shadow-glow'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:shadow-soft'
              }`}
              onClick={() => setFormData({ ...formData, outcome: option.id })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {formData.outcome === option.id && (
                    <CheckCircle className="h-5 w-5 text-primary-600 mr-3" />
                  )}
                  <span className="font-semibold text-gray-900 dark:text-white text-lg">
                    {option.name}
                  </span>
                </div>
                {option.current_odds && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full font-medium">
                    Odds: {option.current_odds}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.outcome && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.outcome}
            </p>
          </div>
        )}
      </div>

      {/* Confidence Slider */}
      <div className="mb-8">
        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          <Target className="h-4 w-4 mr-2 text-secondary-600" />
          Confidence Level: <span className="ml-2 text-lg font-bold text-primary-600 dark:text-primary-400">{formData.confidence}%</span>
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="100"
            value={formData.confidence}
            onChange={(e) =>
              setFormData({ ...formData, confidence: parseInt(e.target.value) })
            }
            className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${formData.confidence}%, #e5e7eb ${formData.confidence}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span className="font-medium">Low (1%)</span>
            <span className="font-medium">High (100%)</span>
          </div>
        </div>
      </div>

      {/* Stake Input */}
      <div className="mb-8">
        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          <DollarSign className="h-4 w-4 mr-2 text-accent-600" />
          Stake Amount (Points) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            value={formData.stake}
            onChange={(e) =>
              setFormData({ ...formData, stake: parseInt(e.target.value) })
            }
            className="input-modern"
            placeholder="Enter stake amount"
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
            pts
          </div>
        </div>
        {errors.stake && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.stake}
            </p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          <MessageSquare className="h-4 w-4 mr-2 text-warning-600" />
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows="4"
          className="input-modern resize-none"
          placeholder="Add any notes about your prediction..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Submitting...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Submit Prediction
          </div>
        )}
      </button>
    </form>
  );
}

