export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: January 2025</p>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        {[
          {
            title: '1. Acceptance of Terms',
            content: 'By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you do not agree to any part of these terms, you may not use our services.',
          },
          {
            title: '2. User Accounts',
            content: 'You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
          },
          {
            title: '3. Listing Rules',
            content: 'You may only list items that you legally own or have the right to sell. Prohibited items include weapons, illegal goods, counterfeit products, adult content, and anything that violates applicable laws. We reserve the right to remove listings that violate our policies.',
          },
          {
            title: '4. Transactions',
            content: 'We are a platform connecting buyers and sellers — we are not a party to any transaction. All agreements are solely between the buyer and seller. We do not guarantee the quality, safety, or legality of listed items.',
          },
          {
            title: '5. Prohibited Conduct',
            content: 'You agree not to: post false or misleading information, harass other users, attempt to defraud others, use automated tools to scrape or access the platform, or interfere with the proper functioning of the service.',
          },
          {
            title: '6. Intellectual Property',
            content: 'All content on this platform, including logos, text, and software, is our intellectual property. You may not copy, reproduce, or distribute our content without written permission.',
          },
          {
            title: '7. Limitation of Liability',
            content: 'To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform or any transactions conducted through it.',
          },
          {
            title: '8. Changes to Terms',
            content: 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.',
          },
          {
            title: '9. Contact',
            content: 'For questions about these terms, please contact us at ahirwarkishan214@gmail.com.',
          },
        ].map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h2>
            <p>{section.content}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
