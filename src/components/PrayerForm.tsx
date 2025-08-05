import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrayerRequest, PrayerStorage } from '@/lib/prayer-storage';
import { Plus, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrayerFormProps {
  members: string[];
  onAdd: () => void;
}

export const PrayerForm = ({ members, onAdd }: PrayerFormProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [form, setForm] = useState({
    memberName: '',
    category: 'other' as PrayerRequest['category'],
    details: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.memberName.trim() || !form.details.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both member name and prayer details.",
        variant: "destructive"
      });
      return;
    }

    PrayerStorage.addRequest({
      memberName: form.memberName.trim(),
      category: form.category,
      details: form.details.trim(),
      notes: form.notes.trim() || undefined,
      dateAdded: new Date().toISOString(),
      status: 'praying'
    });

    setForm({
      memberName: '',
      category: 'other',
      details: '',
      notes: ''
    });
    
    setIsExpanded(false);
    onAdd();
    
    toast({
      title: "Prayer Added",
      description: `Prayer request for ${form.memberName} has been added.`,
    });
  };

  const quickAdd = () => {
    if (form.memberName.trim() && form.details.trim()) {
      handleSubmit(new Event('submit') as any);
    } else {
      setIsExpanded(true);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="bg-gradient-peaceful border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Input
              placeholder="Member name..."
              value={form.memberName}
              onChange={(e) => setForm({...form, memberName: e.target.value})}
              className="flex-1"
            />
            <Input
              placeholder="Prayer request..."
              value={form.details}
              onChange={(e) => setForm({...form, details: e.target.value})}
              className="flex-[2]"
            />
            <Button onClick={quickAdd} className="px-6">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(true)} className="text-primary hover:text-primary-glow">
              Need more options? Click to expand
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-peaceful shadow-elevated animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Heart className="h-5 w-5" />
          Add New Prayer Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Member Name</label>
              <div className="relative">
                <Input
                  list="members-list"
                  placeholder="Enter or select member name"
                  value={form.memberName}
                  onChange={(e) => setForm({...form, memberName: e.target.value})}
                  required
                />
                <datalist id="members-list">
                  {members.map(member => (
                    <option key={member} value={member} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <Select value={form.category} onValueChange={(value) => setForm({...form, category: value as PrayerRequest['category']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="health">🏥 Health</SelectItem>
                  <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                  <SelectItem value="work">💼 Work</SelectItem>
                  <SelectItem value="spiritual">✝️ Spiritual</SelectItem>
                  <SelectItem value="praise">🙌 Praise</SelectItem>
                  <SelectItem value="other">💭 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Prayer Request Details</label>
            <Textarea
              placeholder="Describe the prayer request..."
              value={form.details}
              onChange={(e) => setForm({...form, details: e.target.value})}
              rows={3}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Notes (Optional)</label>
            <Textarea
              placeholder="Additional notes or context..."
              value={form.notes}
              onChange={(e) => setForm({...form, notes: e.target.value})}
              rows={2}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Prayer Request
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsExpanded(false)}>
              Minimize
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};