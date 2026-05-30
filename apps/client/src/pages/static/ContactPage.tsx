import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-8">Have a question or need help? We're here for you.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: '📧', label: 'Email', value: 'support@olxapp.com' },
          { icon: '📞', label: 'Phone', value: '+91 98765 43210' },
          { icon: '🕐', label: 'Hours', value: 'Mon–Sat, 9am–6pm' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-center">
            <p className="text-2xl mb-1">{c.icon}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{c.label}</p>
            <p className="text-sm text-gray-700 mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      {sent ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-8 text-center">
          <p className="text-4xl mb-3">✅</p>
          <h2 className="text-lg font-semibold text-gray-900">Message Sent!</h2>
          <p className="text-gray-500 mt-1 text-sm">We'll get back to you within 24 hours.</p>
          <button onClick={() => setSent(false)} className="mt-4 text-sm text-[#002f34] hover:underline">
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Your Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field" placeholder="Rahul Sharma" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="input-field" placeholder="How can we help?" required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5} className="input-field resize-none" placeholder="Describe your issue or question..." required />
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
      )}
    </div>
  );
}
