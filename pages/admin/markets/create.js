import { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../src/admin/layouts/AdminLayout';
import { adminApi } from '../../../src/admin/services/adminApi';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateMarket() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ends_at: '',
    starting_liquidity: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const marketData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ends_at: formData.ends_at,
        ...(formData.starting_liquidity && {
          starting_liquidity: parseFloat(formData.starting_liquidity),
        }),
      };

      await adminApi.createMarket(marketData);
      router.push('/admin/markets');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create market');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/markets"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Market</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Add a new prediction market</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Provide a detailed description of the market..."
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a category</option>
              <option value="sports">Sports</option>
              <option value="politics">Politics</option>
              <option value="crypto">Crypto</option>
              <option value="technology">Technology</option>
              <option value="entertainment">Entertainment</option>
              <option value="finance">Finance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Ends At */}
          <div>
            <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              id="ends_at"
              name="ends_at"
              required
              value={formData.ends_at}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Starting Liquidity */}
          <div>
            <label htmlFor="starting_liquidity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Starting Liquidity (Optional)
            </label>
            <input
              type="number"
              id="starting_liquidity"
              name="starting_liquidity"
              min="0"
              step="0.01"
              value={formData.starting_liquidity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Initial liquidity amount for the market
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/markets"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Market'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}


