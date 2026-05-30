import { useState } from 'react';

const FAQS = [
  {
    q: 'How do I post an ad?',
    a: 'Click the "+ SELL" button in the top navigation bar. Fill in the details — title, description, price, category, and photos — then click "Post Ad". Your listing will be live immediately.',
  },
  {
    q: 'Is it free to list items?',
    a: 'Yes! Listing items is completely free. We do not charge any commission on sales. You keep 100% of the selling price.',
  },
  {
    q: 'How do I contact a seller?',
    a: 'Open the product detail page and click "Chat with Seller" to start a conversation, or click "Show Phone Number" to call them directly.',
  },
  {
    q: 'How do I edit or delete my ad?',
    a: 'Go to your Seller Dashboard and find the ad. Click "Edit" to update details, or use the status toggle to pause/activate it. To delete, click the delete button.',
  },
  {
    q: 'My OTP is not arriving. What should I do?',
    a: 'Check your spam/junk folder first. If still not received, click "Resend OTP" on the verification page. If the issue persists, contact our support team.',
  },
  {
    q: 'How do I report a suspicious listing?',
    a: 'On the product detail page, scroll down and click "Report this ad". Provide the reason and our team will review it within 24 hours.',
  },
  {
    q: 'Can I change my account role from Buyer to Seller?',
    a: 'Yes. Click "Become a Seller" in the navigation bar or from your profile menu. Your role will be upgraded instantly.',
  },
  {
    q: 'How do I reset my password?',
    a: 'On the login page, click "Forgot password?" and enter your email. You\'ll receive a reset link in your inbox.',
  },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
      <p className="text-gray-500 mb-8">Frequently asked questions</p>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
              <span className="text-gray-400 shrink-0 text-lg">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-[#002f34] text-white p-6 text-center">
        <p className="text-lg font-semibold mb-1">Still need help?</p>
        <p className="text-white/60 text-sm mb-4">Our support team is available Mon–Sat, 9am–6pm</p>
        <a href="/contact" className="inline-block rounded-xl bg-[#ffca28] text-[#002f34] font-bold px-6 py-2.5 text-sm hover:opacity-90 transition">
          Contact Support
        </a>
      </div>
    </div>
  );
}
