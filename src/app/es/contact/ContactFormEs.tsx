'use client';

import { useForm, ValidationError } from '@formspree/react';

export default function ContactFormEs() {
  const [state, handleSubmit] = useForm('xnjlaelb');

  if (state.succeeded) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">¡Mensaje enviado!</h2>
        <p className="text-sm text-gray-500">Te responderemos en un plazo de 48 horas.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text" id="name" name="name" required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email" id="email" name="email" required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="tu@ejemplo.com"
          />
          <ValidationError field="email" prefix="Email" errors={state.errors} className="text-xs text-red-600 mt-1" />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
          <textarea
            id="message" name="message" rows={5} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Cuéntanos cómo podemos ayudarte..."
          />
          <ValidationError field="message" prefix="Message" errors={state.errors} className="text-xs text-red-600 mt-1" />
        </div>
        <button
          type="submit"
          disabled={state.submitting}
          className="w-full bg-green-700 text-white font-semibold py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {state.submitting ? 'Enviando…' : 'Enviar Mensaje'}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-4 text-center">Normalmente respondemos en 48 horas.</p>
    </div>
  );
}
