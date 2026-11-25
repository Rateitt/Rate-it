import Link from "next/link";

const sections = [
  {
    title: "1. About Rate-It",
    content: [
      "Rate-It is an online travel and accommodation marketplace connecting customers with hotels, property rental providers, car rental companies and airport transfer providers.",
      "Our marketplace is launching across East Africa, with plans to expand into other African markets and worldwide.",
      "Rate-It helps customers discover, compare and arrange travel services. The services advertised are provided by the respective hotels and service providers.",
    ],
  },
  {
    title: "2. Accepting these Terms",
    content: [
      "By accessing or using Rate-It, creating an account, listing a service or making a booking, you agree to these Terms and Conditions.",
      "If you do not agree with these terms, please do not use the platform.",
      "You must be at least 18 years old, or the legal age required in your country, to make bookings or register as a provider.",
    ],
  },
  {
    title: "3. Customer responsibilities",
    content: [
      "Customers must provide accurate contact information and correct booking details.",
      "Customers are responsible for checking accommodation descriptions, prices, dates, availability, included services and applicable booking conditions before confirming a booking.",
      "Customers must respect the rules and requirements of the hotel, property owner, vehicle provider or transfer provider they use.",
      "Customers must not use Rate-It for fraudulent, unlawful or misleading activities.",
    ],
  },
  {
    title: "4. Hotel and property bookings",
    content: [
      "Hotels and property providers are responsible for the accommodation, room or property information they publish, including photographs, prices, facilities and availability.",
      "Customers should review the booking conditions and cancellation policy displayed for their chosen accommodation.",
      "Unless an online payment option is expressly made available at checkout, hotel and property payments are made directly to the relevant provider.",
      "A booking confirmation does not remove the provider's responsibility to honour the confirmed reservation.",
    ],
  },
  {
    title: "5. Car rentals and airport transfers",
    content: [
      "Car rental and airport transfer services are supplied by the respective providers.",
      "Where online payment is enabled, customers must follow the payment instructions displayed during booking.",
      "Vehicle providers are responsible for vehicle condition, legal requirements, insurance arrangements and rental conditions.",
      "Transfer providers are responsible for the agreed pickup arrangements, passenger transport and delivery of the booked service.",
      "Customers must check provider requirements, including driving licence, identification, deposits, pickup instructions and any additional charges.",
    ],
  },
  {
    title: "6. Payments and charges",
    content: [
      "The payment method and payment instructions applicable to a booking will be displayed during the booking process or communicated by the provider.",
      "Where payment is made directly to a provider, Rate-It does not collect that payment on the provider's behalf.",
      "Where online payments are enabled, payments may be processed through third-party payment service providers. Their terms and conditions may also apply.",
      "Any customer-facing fees or additional charges must be reviewed before confirming a booking.",
      "Provider commissions or other commercial arrangements between Rate-It and providers do not automatically create an additional charge for customers.",
    ],
  },
  {
    title: "7. Cancellations, changes and refunds",
    content: [
      "Cancellation, amendment and refund conditions may differ between providers and bookings.",
      "Customers should read the cancellation and refund policy displayed before confirming a booking.",
      "Requests to change or cancel a booking should be made through the contact or booking channels provided by Rate-It or the relevant service provider.",
      "Where payment was made directly to a provider, the provider is responsible for handling any applicable refund.",
      "Where an online payment was processed, refunds are subject to the applicable booking conditions and payment provider processing procedures.",
    ],
  },
  {
    title: "8. Provider responsibilities",
    content: [
      "Providers must submit accurate, lawful and up-to-date business, service, pricing and availability information.",
      "Providers are responsible for holding all licences, registrations, permissions and insurance required to operate their services.",
      "Providers must honour confirmed bookings or promptly communicate genuine availability or service problems.",
      "Providers must treat customers fairly and comply with applicable consumer protection, privacy, safety and other laws.",
      "Rate-It may review listings, request verification information, restrict listings or suspend accounts where necessary.",
    ],
  },
  {
    title: "9. Listings, reviews and verification",
    content: [
      "Information, photographs and descriptions submitted by providers must not be false, misleading, unlawful or infringe another person's rights.",
      "Reviews and ratings should reflect genuine customer experiences and must not contain threats, harassment, fraudulent claims or unlawful material.",
      "A verification badge indicates that a provider has completed a Rate-It verification process. It is not a guarantee of service quality, safety or future performance.",
      "Rate-It may remove content or listings that violate these terms or applicable law.",
    ],
  },
  {
    title: "10. Rate-It fees and commissions",
    content: [
      "Rate-It may establish commercial arrangements with providers, including commissions for eligible services.",
      "Any applicable provider fees or commission arrangements will be communicated to providers under the relevant provider terms or agreements.",
      "Provider commission arrangements do not replace the booking price or payment conditions shown to customers.",
      "Rate-It may update its commercial arrangements in accordance with applicable agreements and law.",
    ],
  },
  {
    title: "11. Third-party services",
    content: [
      "Rate-It may link to or use third-party websites, payment processors and service providers.",
      "Those third parties operate under their own terms and privacy policies. Rate-It is not responsible for independent third-party websites or services.",
    ],
  },
  {
    title: "12. Platform availability and limitations",
    content: [
      "We aim to keep Rate-It available and accurate, but we do not guarantee uninterrupted access or that every listing, price or availability detail will always be error-free.",
      "We may update, suspend or discontinue parts of the platform for maintenance, security, operational or business reasons.",
      "Rate-It does not guarantee the conduct, quality or performance of independent service providers. Customers should review provider information and booking conditions before making decisions.",
    ],
  },
  {
    title: "13. Limitation of liability",
    content: [
      "To the extent permitted by applicable law, Rate-It is not responsible for losses arising from inaccurate information supplied by providers, provider cancellations, failure to deliver a service, or disputes between customers and providers.",
      "Nothing in these terms excludes or limits any liability that cannot legally be excluded or limited under applicable law.",
    ],
  },
  {
    title: "14. Privacy and personal information",
    content: [
      "Your use of Rate-It is also subject to our Privacy Policy, which explains how personal information is collected, used and protected.",
      "You can read the Privacy Policy at the link below.",
    ],
  },
  {
    title: "15. Changes to these Terms",
    content: [
      "We may update these Terms and Conditions as Rate-It develops or as legal and operational requirements change.",
      "Updated terms will be published on this page with a revised effective date. Continued use of Rate-It after an update means you accept the revised terms, to the extent permitted by law.",
    ],
  },
  {
    title: "16. Governing law and disputes",
    content: [
      "These terms are subject to the applicable laws and regulations of the countries in which Rate-It operates.",
      "Where a dispute arises, customers and providers are encouraged to contact Rate-It first so that we can try to assist. This does not remove any legal rights or remedies available to you.",
    ],
  },
  {
    title: "17. Contact Rate-It",
    content: [
      "If you have questions about these Terms and Conditions, please contact us through the Rate-It Contact Us page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#1f2937",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px 60px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-block",
            color: "#2563eb",
            textDecoration: "none",
            fontWeight: "700",
            marginBottom: "25px",
          }}
        >
          ← Back to Rate-It
        </Link>

        <div
          style={{
            background: "#ffffff",
            padding: "35px",
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
          }}
        >
          <p
            style={{
              color: "#2563eb",
              fontWeight: "700",
              letterSpacing: "2px",
              fontSize: "13px",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            RATE-IT
          </p>

          <h1
            style={{
              fontSize: "36px",
              color: "#111827",
              margin: "0 0 12px",
            }}
          >
            Terms and Conditions
          </h1>

          <p style={{ color: "#6b7280", lineHeight: "1.7" }}>
            Effective date: 25 November 2026
          </p>

          <p style={{ color: "#4b5563", lineHeight: "1.8" }}>
            Welcome to Rate-It. These Terms and Conditions explain the rules
            that apply when customers and service providers use our online
            marketplace to discover, compare and arrange travel services.
            Please read them carefully.
          </p>

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #e5e7eb",
              margin: "28px 0",
            }}
          />

          {sections.map((section) => (
            <section key={section.title} style={{ marginBottom: "27px" }}>
              <h2
                style={{
                  fontSize: "21px",
                  color: "#111827",
                  margin: "0 0 12px",
                }}
              >
                {section.title}
              </h2>

              {section.content.map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    color: "#4b5563",
                    fontSize: "15px",
                    lineHeight: "1.8",
                    margin: "0 0 10px",
                  }}
                >
                  {paragraph}
                </p>
              ))}

              {section.title === "14. Privacy and personal information" && (
                <Link
                  href="/privacy"
                  style={{
                    color: "#2563eb",
                    fontWeight: "700",
                    textDecoration: "none",
                  }}
                >
                  Read the Rate-It Privacy Policy →
                </Link>
              )}

              {section.title === "17. Contact Rate-It" && (
                <Link
                  href="/contact"
                  style={{
                    color: "#2563eb",
                    fontWeight: "700",
                    textDecoration: "none",
                  }}
                >
                  Contact Us →
                </Link>
              )}
            </section>
          ))}

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #e5e7eb",
              margin: "28px 0",
            }}
          />

          <p style={{ color: "#6b7280", fontSize: "13px", lineHeight: "1.7" }}>
            © 2026 Rate-It. Discover. Compare. Stay.
          </p>
        </div>
      </div>
    </main>
  );
}