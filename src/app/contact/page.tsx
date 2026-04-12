import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the PlantCare Guide team.',
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        Have a question, spotted an error, or want to suggest a plant we should cover?
        We&apos;d love to hear from you.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <form className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Tell us how we can help..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white font-semibold py-3 rounded-lg hover:bg-green-800 transition-colors"
          >
            Send Message
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-4 text-center">
          We typically respond within 48 hours.
        </p>
      </div>
    </div>
  );
}
