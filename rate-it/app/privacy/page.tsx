import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <header className="bg-slate-950 px-6 py-16 text-center text-white">
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-lg">
          Your privacy matters to Rate-It.
        </p>
        <p className="mt-2 text-sm text-gray-300">
          Last updated: 25 November 2026
        </p>
      </header>

      <article className="mx-auto max-w-4xl space-y-8 px-6 py-12 leading-8">
        <section>
          <h2 className="text-2xl font-bold">1. Introduction</h2>
          <p className="mt-3">
            Rate-It is an online travel and accommodation marketplace
            connecting travellers with hotels, holiday properties,
            car rental providers and airport transfer services.
            This Privacy Policy explains how we collect, use,
            protect and share personal information when you use
            our website and services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">2. Information We Collect</h2>
          <p className="mt-3">
            Depending on how you use Rate-It, we may collect:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Name and contact information.</li>
            <li>Email address and telephone number.</li>
            <li>Account registration and login information.</li>
            <li>Booking details and travel preferences.</li>
            <li>Accommodation and service provider information.</li>
            <li>Payment transaction references for services using online payments.</li>
            <li>Reviews, ratings and messages submitted through our platform.</li>
            <li>Technical information such as browser type and device information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
          <p className="mt-3">
            We use information to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Create and manage customer and provider accounts.</li>
            <li>Help customers discover and compare travel services.</li>
            <li>Process and manage bookings.</li>
            <li>Connect customers with relevant service providers.</li>
            <li>Send booking confirmations and important notifications.</li>
            <li>Improve website performance and customer experience.</li>
            <li>Prevent fraud, abuse and unauthorized access.</li>
            <li>Meet applicable legal and regulatory requirements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">4. Bookings and Payments</h2>
          <p className="mt-3">
            Hotel and property bookings are subject to the payment
            arrangements displayed at the time of booking. Where
            pay-at-property arrangements apply, customers pay the
            relevant provider directly.
          </p>
          <p className="mt-3">
            Eligible car rental and airport transfer services may
            support online payments through third-party payment
            providers. Payment information is handled according
            to the applicable payment provider's security and
            privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">5. Sharing Information</h2>
          <p className="mt-3">
            We may share relevant information with:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Hotels and accommodation providers handling bookings.</li>
            <li>Car rental and airport transfer providers fulfilling services.</li>
            <li>Payment service providers processing eligible transactions.</li>
            <li>Technology and hosting providers supporting our platform.</li>
            <li>Authorities where disclosure is legally required.</li>
          </ul>
          <p className="mt-3">
            We do not sell customers' personal information as a
            business practice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">6. Data Security</h2>
          <p className="mt-3">
            We take reasonable technical and organizational measures
            to protect personal information against unauthorized
            access, loss, misuse or disclosure. However, no online
            system can guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">7. Cookies and Website Technology</h2>
          <p className="mt-3">
            Rate-It may use cookies and similar technologies to
            support website functionality, improve performance
            and understand how visitors use the platform.
            You can manage cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">8. Your Privacy Rights</h2>
          <p className="mt-3">
            Subject to applicable law, you may have the right to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Request access to your personal information.</li>
            <li>Request correction of inaccurate information.</li>
            <li>Request deletion of personal information where applicable.</li>
            <li>Object to or restrict certain processing activities.</li>
            <li>Withdraw consent where processing relies on consent.</li>
          </ul>
          <p className="mt-3">
            Some information may need to be retained where required
            by law or for legitimate business purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">9. Third-Party Services</h2>
          <p className="mt-3">
            Rate-It may use third-party services for hosting,
            authentication, communications and payment processing.
            Those services may have their own privacy policies
            governing their handling of information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">10. International Users</h2>
          <p className="mt-3">
            Rate-It is beginning its operations in East Africa
            and intends to expand internationally. Depending on
            where you use our services, your information may be
            processed in different countries, subject to applicable
            data protection requirements.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">11. Changes to This Policy</h2>
          <p className="mt-3">
            We may update this Privacy Policy as our services
            develop or legal requirements change. Updated versions
            will be published on this page with a revised date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold">12. Contact Us</h2>
          <p className="mt-3">
            If you have questions about this Privacy Policy or
            wish to exercise your privacy rights, please contact
            Rate-It through our contact page.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-lg bg-slate-950 px-6 py-3 font-semibold text-white"
          >
            Contact Rate-It
          </Link>
        </section>

        <div className="border-t pt-6">
          <Link href="/" className="font-semibold text-blue-700">
            ← Back to Rate-It
          </Link>
        </div>
      </article>
    </main>
  );
}