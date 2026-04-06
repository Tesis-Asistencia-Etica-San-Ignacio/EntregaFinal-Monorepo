import React from "react";
import { Button } from "../atoms/ui/button";
import { SectionConfig } from "@/types/SectionConfig";
import { FormSection } from "../organisms/FormSection";

interface Props {
  headerTitle: string;
  description: string;
  sections: SectionConfig[];
  spellingWarnings?: React.ReactNode;
  modalForm?: React.ReactNode;
  onFormSubmit: () => void;
}

export const CreateCaseTemplate: React.FC<Props> = ({
  headerTitle,
  description,
  sections,
  spellingWarnings,
  modalForm,
  onFormSubmit,
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      onFormSubmit();
    }}
    className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6"
  >
    <h1 className="text-3xl font-bold text-center text-[#111827] dark:text-inherit">
      {headerTitle}
    </h1>

    <p className="text-center text-gray-500 dark:text-inherit">{description}</p>

    {sections.map((sec) => (
      <FormSection
        key={sec.sectionKey}
        sectionKey={sec.sectionKey}
        title={sec.title}
        open={sec.open}
        onToggle={sec.onToggle}
        formRef={sec.formRef}
        fields={sec.fields}
        initialData={sec.initialData}
        onChange={sec.onChange}
        dynamicFormKey={sec.dynamicFormKey}
        onSpellCheck={sec.onSpellCheck}
        spellWarnings={sec.spellingWarnings}
      />
    ))}

    <div className="flex justify-start">
      <Button type="submit">Previsualizar PDF</Button>
    </div>

    {spellingWarnings}
    {modalForm}
  </form>
);

export default CreateCaseTemplate;
