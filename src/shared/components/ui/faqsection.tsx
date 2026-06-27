"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

type FAQItem = {
  question: string;
  answer: string;
};

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonLabel?: string;
  onButtonClick?: () => void;
  faqsLeft: FAQItem[];
  faqsRight: FAQItem[];
  className?: string;
}

export function FAQSection({
  title = "Product & Account Help",
  subtitle = "Frequently Asked Questions",
  description = "Get instant answers to the most common questions about your account, product setup, and updates.",
  buttonLabel = "Browse All FAQs →",
  onButtonClick,
  faqsLeft,
  faqsRight,
  className,
}: FAQSectionProps) {
  return (
    <section className={cn("w-full max-w-5xl mx-auto py-20 px-6 sm:px-8", className)}>
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-800 mb-3">
          {subtitle}
        </p>
        <h2 className="text-3xl sm:text-4xl font-playfair font-normal leading-tight text-slate-950 mb-4">
          {title}
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
        <Button 
          className="bg-emerald-900 hover:bg-emerald-950 text-white font-bold h-11 px-8 rounded-full shadow-xs cursor-pointer transition-all duration-150"
          onClick={onButtonClick}
        >
          {buttonLabel}
        </Button>
      </div>

      {/* FAQs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 text-left">
        {[faqsLeft, faqsRight].map((faqColumn, columnIndex) => (
          <Accordion
            key={columnIndex}
            type="single"
            collapsible
            className="w-full"
          >
            {faqColumn.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${columnIndex}-${i}`}
                className="border-b border-emerald-900/10 py-1"
              >
                <AccordionTrigger className="text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-800 hover:no-underline transition-colors py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm text-slate-500 leading-relaxed pb-4">
                  <div className="min-h-[40px] transition-all duration-200 ease-in-out text-slate-600">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ))}
      </div>
    </section>
  );
}
