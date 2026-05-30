const TIPS = [
  {
    icon: '🤝',
    title: 'Meet in a Safe Place',
    tips: [
      'Always meet in a public, well-lit location — a coffee shop, mall, or police station parking lot.',
      'Avoid meeting at your home or the seller\'s home, especially for high-value items.',
      'Bring a friend or family member if possible.',
    ],
  },
  {
    icon: '💰',
    title: 'Payment Safety',
    tips: [
      'Never pay in advance before inspecting the item.',
      'Prefer cash or UPI for in-person transactions.',
      'Be very cautious of sellers who only accept bank transfers or gift cards.',
      'Do not share your card details, OTP, or CVV with anyone.',
    ],
  },
  {
    icon: '🔍',
    title: 'Verify Before Buying',
    tips: [
      'Inspect the item thoroughly before handing over money.',
      'Test electronics, vehicles, and appliances before purchase.',
      'Ask for original bills, receipts, or ownership documents for vehicles and electronics.',
      'If the deal seems too good to be true, it probably is.',
    ],
  },
  {
    icon: '🔒',
    title: 'Protect Your Personal Info',
    tips: [
      'Never share your Aadhaar, PAN, bank account details, or passwords.',
      'Do not click on external links sent by strangers.',
      'Report suspicious behaviour immediately using the Report button.',
    ],
  },
  {
    icon: '📱',
    title: 'Account Security',
    tips: [
      'Use a strong, unique password for your account.',
      'Never share your OTP with anyone — our team will never ask for it.',
      'Log out of shared or public devices after use.',
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Tips</h1>
      <p className="text-gray-500 mb-8">
        Your safety is our priority. Follow these guidelines to stay protected when buying or selling.
      </p>

      <div className="space-y-6">
        {TIPS.map((section) => (
          <div key={section.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{section.icon}</span>
              <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-[#002f34] font-bold shrink-0">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-100 p-5">
        <p className="font-semibold text-amber-800 mb-1">🚨 Spotted something suspicious?</p>
        <p className="text-sm text-amber-700">
          Report scams, fraudulent listings, or suspicious users directly from the platform.
          Our team reviews all reports within 24 hours.
        </p>
      </div>
    </div>
  );
}
