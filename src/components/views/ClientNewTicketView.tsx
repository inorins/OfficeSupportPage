import { useState } from 'react';
import { Upload, FileText, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { systemModules } from '@/data/mockData';
import { api } from '@/services/api';
import { useApiMode } from '@/context/ApiModeContext';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ClientNewTicketViewProps {
  onSuccess: () => void;
}

const STEPS = ['Issue Details', 'System & Module', 'Attachments'];

export function ClientNewTicketView({ onSuccess }: ClientNewTicketViewProps) {
  const { isApiMode } = useApiMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [isProduction, setIsProduction] = useState(false);
  const [system, setSystem] = useState('');
  const [module, setModule] = useState('');
  const [form, setForm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modules = system ? Object.keys(systemModules[system] || {}) : [];
  const forms = system && module ? systemModules[system]?.[module] || [] : [];

  const handleSystemChange = (v: string) => { setSystem(v); setModule(''); setForm(''); };
  const handleModuleChange = (v: string) => { setModule(v); setForm(''); };

  const canNextStep1 = title.trim().length > 0 && priority.length > 0;
  const canNextStep2 = system.length > 0 && module.length > 0 && form.length > 0;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (isApiMode) {
      try {
        await api.createTicket({
          title,
          description,
          priority: priority as any,
          system,
          module,
          form,
          environment: isProduction ? 'Production' : 'UAT',
          reporter: user?.name,
          reporterEmail: user?.email,
        });
        await queryClient.invalidateQueries({ queryKey: ['tickets'] });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      setIsSubmitting(false);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Ticket Submitted!</h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Your ticket has been received by the Inorins support team. You'll be notified as soon as it's assigned.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSuccess}>View My Tickets</Button>
          <Button onClick={() => {
            setSubmitted(false);
            setStep(1);
            setTitle(''); setDescription(''); setPriority('');
            setSystem(''); setModule(''); setForm('');
            setIsProduction(false);
          }}>
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Submit a Support Ticket</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Describe the issue and our team will get back to you shortly.
        </p>
      </div>

      {/* Reporter badge */}
      <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border mb-6">
        <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center text-xs font-bold text-info">
          {user?.bankShortCode}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email} · {user?.bankName}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, idx) => {
          const s = idx + 1;
          const done = step > s;
          const active = step === s;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
                done ? 'bg-success text-white' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {done ? '✓' : s}
              </div>
              <span className={cn('text-xs font-medium', active ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
              {s < STEPS.length && <div className="w-8 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4 bg-card rounded-lg border border-border p-5">
          <div className="space-y-1.5">
            <Label>Issue Title <span className="text-primary">*</span></Label>
            <Input
              placeholder="Brief summary of the problem"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe the issue in detail — steps to reproduce, error messages, affected users..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority <span className="text-primary">*</span></Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical — System down</SelectItem>
                  <SelectItem value="High">High — Major impact</SelectItem>
                  <SelectItem value="Medium">Medium — Partial impact</SelectItem>
                  <SelectItem value="Low">Low — Minor issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Environment</Label>
              <div className="flex items-center gap-3 h-10 px-3 bg-surface rounded-md border border-border">
                <span className={cn('text-sm font-medium', !isProduction ? 'text-foreground' : 'text-muted-foreground')}>UAT</span>
                <Switch checked={isProduction} onCheckedChange={setIsProduction} />
                <span className={cn('text-sm font-medium', isProduction ? 'text-primary' : 'text-muted-foreground')}>Production</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4 bg-card rounded-lg border border-border p-5">
          <p className="text-sm text-muted-foreground">
            Select the Inorins system, module, and form where the issue occurred.
          </p>
          <div className="space-y-1.5">
            <Label>System <span className="text-primary">*</span></Label>
            <Select value={system} onValueChange={handleSystemChange}>
              <SelectTrigger><SelectValue placeholder="Which system?" /></SelectTrigger>
              <SelectContent>
                {Object.keys(systemModules).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Module <span className="text-primary">*</span></Label>
            <Select value={module} onValueChange={handleModuleChange} disabled={!system}>
              <SelectTrigger><SelectValue placeholder={system ? 'Select module' : 'Select a system first'} /></SelectTrigger>
              <SelectContent>
                {modules.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Form / Screen <span className="text-primary">*</span></Label>
            <Select value={form} onValueChange={setForm} disabled={!module}>
              <SelectTrigger><SelectValue placeholder={module ? 'Select form' : 'Select a module first'} /></SelectTrigger>
              <SelectContent>
                {forms.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-4 bg-card rounded-lg border border-border p-5">
          <p className="text-sm text-muted-foreground">
            Attach any screenshots, logs, or files that will help diagnose the issue.
          </p>
          <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-3 bg-surface hover:border-primary/40 transition-colors cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, PDF, LOG up to 10MB each</p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface rounded-md border border-border">
            <FileText className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">error_screenshot.png</p>
              <p className="text-xs text-muted-foreground">245 KB</p>
            </div>
            <button className="text-xs text-primary hover:underline">Remove</button>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-surface border border-border p-4 space-y-1.5 text-sm">
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide text-muted-foreground mb-2">Summary</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span className="font-medium text-foreground truncate max-w-[60%]">{title}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Priority</span><span className="font-medium text-foreground">{priority}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">System</span><span className="font-medium text-foreground">{system} › {module} › {form}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Environment</span><span className="font-medium text-foreground">{isProduction ? 'Production' : 'UAT'}</span></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : onSuccess()}
          size="sm"
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
          size="sm"
          disabled={
            isSubmitting ||
            (step === 1 && !canNextStep1) ||
            (step === 2 && !canNextStep2)
          }
          className="gap-1.5"
        >
          {step === 3
            ? isSubmitting
              ? 'Submitting…'
              : <><Send className="h-3.5 w-3.5" /> Submit Ticket</>
            : 'Next →'
          }
        </Button>
      </div>
    </div>
  );
}
