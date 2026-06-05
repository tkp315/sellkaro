export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-400 text-sm mb-8">Last updated: January 2025</p>

      <div className="space-y-8 text-gray-600 leading-relaxed">
        {[
          {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly, such as your name, email address, phone number, and profile photo. We also collect usage data including pages viewed, search queries, and interactions with listings.',
          },
          {
            title: '2. How We Use Your Information',
            content: 'We use your information to: operate and improve the platform, send you OTP codes and notifications, personalise your experience, prevent fraud and abuse, and comply with legal obligations.',
          },
          {
            title: '3. Information Sharing',
            content: 'We do not sell your personal information. We may share data with service providers (such as email delivery, cloud hosting) who assist us in operating the platform. Your phone number is only shared with buyers when you explicitly choose to reveal it.',
          },
          {
            title: '4. Data Security',
            content: 'We use industry-standard security measures including encryption, secure servers, and access controls to protect your data. However, no method of transmission over the internet is 100% secure.',
          },
          {
            title: '5. Cookies',
            content: 'We use cookies and similar technologies to maintain your session, remember preferences, and analyse platform usage. You can control cookies through your browser settings.',
          },
          {
            title: '6. Your Rights',
            content: 'You have the right to access, correct, or delete your personal data at any time through your profile settings. You may also contact us to request data deletion.',
          },
          {
            title: '7. Data Retention',
            content: 'We retain your data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, subject to legal obligations.',
          },
          {
            title: '8. Contact',
            content: 'For privacy-related queries, contact us at ahirwarkishan214@gmail.com.',
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
