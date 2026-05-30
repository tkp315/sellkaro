export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About Us</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: January 2025</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Who We Are</h2>
          <p>
            We are India's growing online marketplace that connects buyers and sellers across the country.
            Our platform makes it easy to buy and sell used goods — from mobiles and electronics to cars,
            furniture, and more — completely free of charge.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h2>
          <p>
            We believe that everything has value. Our mission is to create a trusted, safe, and efficient
            platform where people can give a second life to their belongings while saving money and reducing waste.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">What We Offer</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Free listing for all categories — no commissions, no hidden fees</li>
            <li>Verified buyer and seller profiles</li>
            <li>Real-time chat between buyers and sellers</li>
            <li>Location-based search to find deals near you</li>
            <li>Secure and spam-free environment</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Values</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-3">
            {[
              { icon: '🤝', title: 'Trust', desc: 'Every transaction is built on mutual trust and transparency.' },
              { icon: '🛡️', title: 'Safety', desc: 'We actively moderate listings to keep the platform safe.' },
              { icon: '🌱', title: 'Sustainability', desc: 'Reusing items helps reduce waste and carbon footprint.' },
            ].map((v) => (
              <div key={v.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-2xl mb-2">{v.icon}</p>
                <p className="font-semibold text-gray-800 mb-1">{v.title}</p>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
