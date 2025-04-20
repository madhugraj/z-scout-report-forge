
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const agents = [
  { id: 'gemini', name: 'Gemini T&S Agent v1.2' },
  { id: 'openai', name: 'OpenAI Trust Filter' },
  { id: 'zscout', name: 'Z Scout In-House Auditor' },
  { id: 'manual', name: 'Manual Review Mode' },
];

interface AuditAgentDropdownProps {
  onAgentChange: (agent: string) => void;
}

const AuditAgentDropdown = ({ onAgentChange }: AuditAgentDropdownProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Audit Agent</label>
      <Select defaultValue="gemini" onValueChange={onAgentChange}>
        <SelectTrigger className="w-full bg-[#2A2F3C] border-gray-700 text-white">
          <SelectValue placeholder="Select an agent" />
        </SelectTrigger>
        <SelectContent className="bg-[#2A2F3C] border-gray-700">
          {agents.map((agent) => (
            <SelectItem 
              key={agent.id} 
              value={agent.id}
              className="text-gray-200 focus:bg-violet-500/20 focus:text-violet-200"
            >
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AuditAgentDropdown;
