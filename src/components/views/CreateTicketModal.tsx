import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, FileText } from 'lucide-react';
import { systemModules } from '@/data/mockData';
import { api } from '@/services/api';
import { useApiMode } from '@/context/ApiModeContext';
import { useQueryClient } from '@tanstack/react-query';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTicketModal({ open, onClose }: CreateTicketModalProps) {
  const { isApiMode } = useApiMode();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [system, setSystem] = useState('');
  const [module, setModule] = useState('');
  const [form, setForm] = useState('');
  const [isProduction, setIsProduction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modules = system ? Object.keys(systemModules[system] || {}) : [];
  const forms = system && module ? systemModules[system]?.[module] || [] : [];

  const handleSystemChange = (val: string) => {
    setSystem(val);
    setModule('');
    setForm('');
  };

  const handleModuleChange = (val: string) => {
    setModule(val);
    setForm('');
  };

  const reset = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setPriority('');
    setSystem('');
    setModule('');
    setForm('');
    setIsProduction(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (isApiMode) {
      setIsSubmitting(true);
      try {
        await api.createTicket({
          title,
          description,
          priority: priority as any,
          system,
          module,
          form,
          environment: isProduction ? 'Production' : 'UAT',
        });
        await queryClient.invalidateQueries({ queryKey: ['tickets'] });
      } finally {
        setIsSubmitting(false);
      }
    }
    onClose();
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); reset(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">Create New Ticket</DialogTitle>
          <DialogDescription>Provide details about the issue to help our team resolve it quickly.</DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Issue Details' : s === 2 ? 'CBS Hierarchy' : 'Attachments'}
              </span>
              {s < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Brief summary of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue in detail, including steps to reproduce..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Environment</Label>
                <div className="flex items-center gap-3 h-10 px-3 bg-surface rounded-md border border-border">
                  <span className={`text-sm font-medium ${!isProduction ? 'text-foreground' : 'text-muted-foreground'}`}>UAT</span>
                  <Switch checked={isProduction} onCheckedChange={setIsProduction} />
                  <span className={`text-sm font-medium ${isProduction ? 'text-primary' : 'text-muted-foreground'}`}>Production</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select the system, module, and form related to your issue.</p>
            <div className="space-y-2">
              <Label>System</Label>
              <Select value={system} onValueChange={handleSystemChange}>
                <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(systemModules).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={module} onValueChange={handleModuleChange} disabled={!system}>
                <SelectTrigger><SelectValue placeholder={system ? 'Select module' : 'Select a system first'} /></SelectTrigger>
                <SelectContent>
                  {modules.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Form</Label>
              <Select value={form} onValueChange={setForm} disabled={!module}>
                <SelectTrigger><SelectValue placeholder={module ? 'Select form' : 'Select a module first'} /></SelectTrigger>
                <SelectContent>
                  {forms.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Attach screenshots or relevant files to help diagnose the issue.</p>
            <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-surface hover:border-primary/40 transition-colors cursor-pointer">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface rounded-md border border-border">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">error_screenshot.png</p>
                <p className="text-xs text-muted-foreground">245 KB</p>
              </div>
              <button className="text-xs text-primary hover:underline">Remove</button>
            </div>
            {isApiMode && (
              <p className="text-xs text-muted-foreground">
                Submitting will call <span className="font-mono">POST /api/tickets</span>
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : (onClose(), reset())}
            size="sm"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            size="sm"
            disabled={isSubmitting}
          >
            {step === 3 ? (isSubmitting ? 'Submitting…' : 'Submit Ticket') : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
