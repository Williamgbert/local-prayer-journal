import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PrayerRequest, getCategoryIcon, getStatusIcon, PrayerStorage } from '@/lib/prayer-storage';
import { Edit3, Calendar, Heart, Trash2 } from 'lucide-react';

interface PrayerCardProps {
  request: PrayerRequest;
  onUpdate: () => void;
}

export const PrayerCard = ({ request, onUpdate }: PrayerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    memberName: request.memberName,
    category: request.category,
    details: request.details,
    notes: request.notes || '',
    status: request.status,
    answerDate: request.answerDate || ''
  });

  const handleSave = () => {
    const updates: Partial<PrayerRequest> = {
      memberName: editForm.memberName,
      category: editForm.category as PrayerRequest['category'],
      details: editForm.details,
      notes: editForm.notes,
      status: editForm.status as PrayerRequest['status']
    };

    if (editForm.status === 'answered' && !request.answerDate) {
      updates.answerDate = new Date().toISOString();
    } else if (editForm.status !== 'answered') {
      updates.answerDate = undefined;
    }

    PrayerStorage.updateRequest(request.id, updates);
    onUpdate();
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this prayer request?')) {
      PrayerStorage.deleteRequest(request.id);
      onUpdate();
    }
  };

  const getStatusColor = (status: PrayerRequest['status']) => {
    switch (status) {
      case 'praying': return 'bg-prayer-praying/10 text-prayer-praying border-prayer-praying/20';
      case 'answered': return 'bg-prayer-answered/10 text-prayer-answered border-prayer-answered/20';
      case 'archived': return 'bg-prayer-archived/10 text-prayer-archived border-prayer-archived/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-gradient-prayer-card shadow-prayer-card hover:shadow-elevated transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon(request.category)}</span>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{request.memberName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {getStatusIcon(request.status)} {request.status}
                </Badge>
                <span className="text-sm text-muted-foreground capitalize">{request.category}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Prayer Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Member name"
                    value={editForm.memberName}
                    onChange={(e) => setEditForm({...editForm, memberName: e.target.value})}
                  />
                  
                  <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value as PrayerRequest['category']})}>
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

                  <Textarea
                    placeholder="Prayer details..."
                    value={editForm.details}
                    onChange={(e) => setEditForm({...editForm, details: e.target.value})}
                    rows={3}
                  />

                  <Textarea
                    placeholder="Notes (optional)"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    rows={2}
                  />

                  <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value as PrayerRequest['status']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="praying">🙏 Praying</SelectItem>
                      <SelectItem value="answered">✅ Answered</SelectItem>
                      <SelectItem value="archived">📁 Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} className="flex-1">Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-foreground mb-3 leading-relaxed">{request.details}</p>
        
        {request.notes && (
          <div className="bg-accent/50 rounded-lg p-3 mb-3">
            <p className="text-sm text-accent-foreground">
              <strong>Notes:</strong> {request.notes}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Added {formatDate(request.dateAdded)}
          </span>
          
          {request.answerDate && (
            <span className="flex items-center gap-1 text-prayer-answered">
              <Heart className="h-4 w-4" />
              Answered {formatDate(request.answerDate)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};