import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/ui/button";
import { DynamicForm, DynamicFormHandles } from "../molecules/Dynamic-form";
import type { FormField } from "@/types/formTypes";
import type { LTMatch } from "@/lib/api/languageApi";

export interface FormSectionProps {
  sectionKey: string;
  title: string;
  dynamicFormKey?: string;
  open: boolean;
  onToggle: () => void;
  formRef: React.RefObject<DynamicFormHandles>;
  fields: FormField[];
  initialData: Record<string, string>;
  onChange: (vals: Record<string, string>) => void;
  onSpellCheck?: (key: string, text: string) => void;
  spellWarnings?: Record<string, LTMatch[]>;
}

export const FormSection: React.FC<FormSectionProps> = ({
  sectionKey,
  title,
  dynamicFormKey,
  open,
  onToggle,
  formRef,
  fields,
  initialData,
  onChange,
  onSpellCheck,
  spellWarnings,
}) => {
  return (
    <div
      key={sectionKey}
      data-section-key={sectionKey}
      className={cn(
        "group rounded-lg transition-all duration-200 ease-in-out border border-border/50",
        open
          ? "bg-gradient-to-br from-background via-muted/50 to-background"
          : "hover:bg-muted/50"
      )}
    >
      <Button
        variant="ghost"
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 h-auto justify-between hover:bg-transparent shadow border"
      >
        <h3
          className={cn(
            "text-base font-medium transition-colors duration-200 text-left",
            open ? "text-foreground" : "text-foreground/70"
          )}
        >
          {title}
        </h3>
        <motion.div
          animate={{
            rotate: open ? 180 : 0,
            scale: open ? 1.1 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "p-0.5 rounded-full flex-shrink-0 transition-colors duration-200",
            open ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pt-2 pb-4">
              <DynamicForm
                key={dynamicFormKey ?? sectionKey}
                ref={formRef}
                formDataConfig={fields}
                initialData={initialData}
                onChange={onChange}
                onSpellCheck={onSpellCheck}
                spellWarnings={spellWarnings}
                containerClassName="flex flex-col gap-6"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
