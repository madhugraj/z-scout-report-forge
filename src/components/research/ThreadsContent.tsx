
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThreadsContent: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-[#1A1F2C] text-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Discussion Threads</h3>
      </div>
      <div className="space-y-4">
        {[
          { title: "Ethical considerations of AI in mental health", replies: 12, lastUpdated: "2 hours ago" },
          { title: "Limitations of current research methods", replies: 8, lastUpdated: "1 day ago" },
          { title: "Potential future applications to explore", replies: 15, lastUpdated: "3 days ago" },
          { title: "Data privacy concerns with AI therapy", replies: 22, lastUpdated: "1 week ago" }
        ].map((thread, index) => (
          <div key={index} className="bg-[#2A2F3C] p-4 rounded-lg border border-gray-800">
            <div className="flex items-start gap-3">
              <div className="bg-gray-800 p-2 rounded">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{thread.title}</h4>
                <p className="text-sm text-gray-400">{thread.replies} replies • Last updated {thread.lastUpdated}</p>
                <Button variant="ghost" size="sm" className="mt-2 text-violet-400">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Discussion
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button variant="outline" className="w-full mt-4 text-white">
          <MessageSquare className="h-4 w-4 mr-2" />
          Start New Discussion
        </Button>
      </div>
    </div>
  );
};

export default ThreadsContent;
