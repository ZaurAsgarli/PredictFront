import { useEffect } from 'react';

export default function CreateMarket() {
  useEffect(() => {
    // Redirect to admin app create market
    window.location.href = 'http://localhost:3001/markets/create';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to create market...</p>
      </div>
    </div>
  );
}

// Old implementation - now redirects to separate admin app
/*
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import AdminAuthGuard from '../../../src/admin/components/AdminAuthGuard';
import Link from 'next/link';
import { adminApi } from '../../../src/admin/services/adminApi';

const categories = [
  'Sports',
  'Politics',
  'Technology',
  'Entertainment',
  'Finance',
  'Science',
  'Other',
];

export default function CreateMarket() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ends_at: '',
    starting_liquidity: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ends_at: formData.ends_at,
      };

      if (formData.starting_liquidity) {
        payload.starting_liquidity = parseFloat(formData.starting_liquidity);
      }

      await adminApi.createMarket(payload);
      router.push('/admin/markets');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error creating market'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthGuard>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/markets"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Market</h1>
            <p className="text-gray-600 mt-1">Add a new prediction market</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Will Bitcoin reach $100k by 2025?"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Provide detailed description of the market..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ends_at" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="ends_at"
                  name="ends_at"
                  required
                  value={formData.ends_at}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="starting_liquidity" className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <p className="mt-1 text-sm text-gray-500">
                Initial liquidity amount for the market
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {loading ? 'Creating...' : 'Create Market'}
              </button>
              <Link
                href="/admin/markets"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </AdminAuthGuard>
  );
}


