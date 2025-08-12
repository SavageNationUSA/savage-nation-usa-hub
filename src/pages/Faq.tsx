import { SEO } from "@/components/SEO";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
};

const fetchFaqs = async (): Promise<FaqItem[]> => {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data as FaqItem[];
};

const Faq = () => {
  const {
    data: faqs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["faqs"],
    queryFn: fetchFaqs,
  });

  const structuredData = faqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <main className="container mx-auto py-10">
      <SEO
        title="FAQ — Savage Nation USA"
        description="Answers to common questions about Savage Nation USA."
        structuredData={structuredData}
      />
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>

      {isLoading && <p className="text-muted-foreground">Loading FAQs...</p>}
      {error && (
        <p className="text-destructive">
          Error loading FAQs: {error instanceof Error ? error.message : String(error)}
        </p>
      )}

      {faqs && faqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem value={faq.id} key={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        !isLoading &&
        !error && (
          <p className="text-muted-foreground">No questions yet. Check back soon!</p>
        )
      )}
    </main>
  );
};

export default Faq;
