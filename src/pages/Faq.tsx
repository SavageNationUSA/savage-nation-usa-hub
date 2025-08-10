import { SEO } from "@/components/SEO";

const Faq = () => {
  const structured = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do you support veterans?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We donate a portion of proceeds and collaborate with vetted charities to support veterans and their families.",
        },
      },
      {
        "@type": "Question",
        name: "When will the store be live?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The full checkout experience is coming soon. Join our newsletter to be notified.",
        },
      },
      {
        "@type": "Question",
        name: "Do you ship internationally?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we plan to offer international shipping for select products.",
        },
      },
    ],
  };

  return (
    <main className="container mx-auto py-10">
      <SEO title="FAQ — Savage Nation USA" description="Answers to common questions about Savage Nation USA." structuredData={structured} />
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>How do you support veterans? We donate a portion of proceeds and collaborate with vetted charities.</p>
        <p>When will the store be live? Very soon—stay tuned.</p>
        <p>Do you ship internationally? Yes, for select products.</p>
      </div>
    </main>
  );
};

export default Faq;
