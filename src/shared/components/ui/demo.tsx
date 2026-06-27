// This is a demo of a preview
// That's what users will see in the preview

import { FullScreenSignup } from "@/shared/components/ui/full-screen-signup";
import { OriginButton } from "@/shared/components/ui/origin-button";
import { FAQSection } from "@/shared/components/ui/faqsection";

const DemoOne = () => {
  return <FullScreenSignup />;
};

export function OriginButtonPreview() {
  return <OriginButton>Origin Button</OriginButton>;
}

export function FAQDemoPage() {
  const faqsLeft = [
    {
      question: "Are your supplement blends organic?",
      answer:
        "Yes, all Zamazor blends are crafted using 100% organic, non-GMO botanical ingredients and clean minerals with no synthetic fillers.",
    },
    {
      question: "How should I store the powders?",
      answer:
        "Store canisters in a cool, dry place away from direct sunlight. Make sure the lid is sealed tightly after each serving to preserve freshness.",
    },
    {
      question: "Can I take multiple Zamazor formulas together?",
      answer:
        "Absolutely. Our formulas are designed to work synergistically. For example, pairing our Greens with Protein in a morning shake is highly recommended.",
    },
  ];

  const faqsRight = [
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day money-back guarantee on all our clean supplements. If you're not completely satisfied, reach out to our team for a full refund.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 3-5 business days. Express options are available at checkout. All orders over $50 qualify for free standard shipping.",
    },
    {
      question: "Can I pause or edit my subscription?",
      answer:
        "Yes, you can manage, pause, or edit your supplement subscription frequency and flavor choices at any time directly from your account page.",
    },
  ];

  return (
    <FAQSection
      title="Clean Supplement FAQ"
      subtitle="Zamazor Support"
      description="Got questions about our organic blends, subscriptions, or shipping? Here are the quick answers."
      buttonLabel="Help Center"
      faqsLeft={faqsLeft}
      faqsRight={faqsRight}
    />
  );
}

// IMPORTANT:
// format of the export MUST be export default { DemoOneOrOtherName }
// if you don't do this, the demo will not be shown
export default { DemoOne, OriginButtonPreview, FAQDemoPage };
