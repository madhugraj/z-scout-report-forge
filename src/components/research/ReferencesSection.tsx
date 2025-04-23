
import React from "react";
import { Reference } from "@/hooks/useGeminiReport";
import { Button } from "@/components/ui/button";

interface ReferencesSectionProps {
  references: Reference[];
  show: boolean;
  onToggle: () => void;
}

const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  references,
  show,
  onToggle
}) => {
  if (!show || references.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">References</h2>
        <Button variant="outline" size="sm" onClick={onToggle}>
          Hide References
        </Button>
      </div>
      <div className="space-y-4">
        {references.map((reference, index) => (
          <div key={index} className="text-gray-700 p-2 border-b border-gray-100">
            <p className="text-sm">
              [{reference.id}] {reference.authors} ({reference.year}). <strong>{reference.title}</strong>. <em>{reference.journal}</em>.
              {reference.url && (
                <span> <a href={reference.url} className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">Link</a></span>
              )}
              {reference.doi && !reference.url && (
                <span> <a href={`https://doi.org/${reference.doi}`} className="text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">DOI: {reference.doi}</a></span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferencesSection;
