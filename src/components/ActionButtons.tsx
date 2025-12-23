import { FileText, Clock, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ActionButtonsProps {
  plotNumber?: string;
}

export const ActionButtons = ({ plotNumber }: ActionButtonsProps) => {
  const handleDownload = () => {
    toast.success('Preparing Due Diligence PDF...', {
      description: `Report for ${plotNumber || 'selected plot'} will be ready shortly.`,
    });
  };

  const handleTimeline = () => {
    toast.info('Historical Timeline', {
      description: `Viewing historical data for ${plotNumber || 'selected plot'}.`,
    });
  };

  const handleAnnotation = () => {
    toast.info('Add Annotation', {
      description: 'Annotation feature coming soon.',
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={handleDownload}
        className="w-full justify-start gap-2"
        variant="default"
      >
        <FileText className="w-4 h-4" />
        Download Due Diligence PDF
      </Button>
      <Button 
        onClick={handleTimeline}
        className="w-full justify-start gap-2"
        variant="secondary"
      >
        <Clock className="w-4 h-4" />
        View Historical Timeline
      </Button>
      <Button 
        onClick={handleAnnotation}
        className="w-full justify-start gap-2"
        variant="outline"
      >
        <PenLine className="w-4 h-4" />
        Add Owner Annotation
      </Button>
    </div>
  );
};
