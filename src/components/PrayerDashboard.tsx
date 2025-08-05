import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { PrayerForm } from './PrayerForm';
import { PrayerCard } from './PrayerCard';
import { PrayerRequest, PrayerStorage } from '@/lib/prayer-storage';
import { Search, Download, Upload, FileText, Calendar, Users, Heart, Archive, Settings, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PrayerDashboard = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('this-week');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  useEffect(() => {
    loadData();
    const isDark = localStorage.getItem('dark-mode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const loadData = () => {
    const data = PrayerStorage.getData();
    setRequests(data.requests);
    setMembers(data.members);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('dark-mode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = 
        request.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.notes && request.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = filterCategory === 'all' || request.category === filterCategory;
      const matchesMember = filterMember === 'all' || request.memberName === filterMember;
      
      return matchesSearch && matchesCategory && matchesMember;
    });
  }, [requests, searchTerm, filterCategory, filterMember]);

  const groupedRequests = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    return {
      thisWeek: filteredRequests.filter(r => 
        new Date(r.dateAdded) >= weekStart && r.status === 'praying'
      ),
      praying: filteredRequests.filter(r => r.status === 'praying'),
      answered: filteredRequests.filter(r => r.status === 'answered'),
      praises: filteredRequests.filter(r => r.category === 'praise' || r.status === 'answered'),
      archived: filteredRequests.filter(r => r.status === 'archived')
    };
  }, [filteredRequests]);

  const handleExport = (format: 'json' | 'text') => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = PrayerStorage.exportData();
        filename = `prayer-tracker-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        content = PrayerStorage.exportAsText();
        filename = `prayer-tracker-${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Prayer data exported as ${format.toUpperCase()}`,
      });
      setShowExportDialog(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  const handleImport = () => {
    try {
      if (PrayerStorage.importData(importData)) {
        loadData();
        setImportData('');
        setShowExportDialog(false);
        toast({
          title: "Import Successful",
          description: "Prayer data has been imported successfully.",
        });
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Please check your data format and try again.",
        variant: "destructive"
      });
    }
  };

  const getStats = () => {
    return {
      total: requests.length,
      praying: requests.filter(r => r.status === 'praying').length,
      answered: requests.filter(r => r.status === 'answered').length,
      thisWeek: groupedRequests.thisWeek.length
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-peaceful border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Heart className="h-8 w-8" />
                Prayer Tracker
              </h1>
              <p className="text-muted-foreground mt-1">Supporting your group through prayer</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export & Import Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Export Data</h4>
                      <div className="flex gap-2">
                        <Button onClick={() => handleExport('json')} variant="outline" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Export JSON
                        </Button>
                        <Button onClick={() => handleExport('text')} variant="outline" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Export Text
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Import Data</h4>
                      <Textarea
                        placeholder="Paste your JSON data here..."
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        rows={4}
                      />
                      <Button onClick={handleImport} className="w-full mt-2" disabled={!importData.trim()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Requests</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-prayer-praying">{stats.praying}</div>
                <div className="text-sm text-muted-foreground">Actively Praying</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-prayer-answered">{stats.answered}</div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-prayer-praise">{stats.thisWeek}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Add Prayer Form */}
        <div className="mb-6">
          <PrayerForm members={members} onAdd={loadData} />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search prayers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="health">🏥 Health</SelectItem>
                  <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                  <SelectItem value="work">💼 Work</SelectItem>
                  <SelectItem value="spiritual">✝️ Spiritual</SelectItem>
                  <SelectItem value="praise">🙌 Praise</SelectItem>
                  <SelectItem value="other">💭 Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMember} onValueChange={setFilterMember}>
                <SelectTrigger>
                  <SelectValue placeholder="All Members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {members.map(member => (
                    <SelectItem key={member} value={member}>{member}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center">
                <Badge variant="outline" className="text-sm">
                  {filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Requests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:inline-flex">
            <TabsTrigger value="this-week" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              This Week ({groupedRequests.thisWeek.length})
            </TabsTrigger>
            <TabsTrigger value="praying" className="flex items-center gap-2">
              <span className="text-lg">🙏</span>
              Praying ({groupedRequests.praying.length})
            </TabsTrigger>
            <TabsTrigger value="answered" className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              Answered ({groupedRequests.answered.length})
            </TabsTrigger>
            <TabsTrigger value="praises" className="flex items-center gap-2">
              <span className="text-lg">🙌</span>
              Praises ({groupedRequests.praises.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archived ({groupedRequests.archived.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="this-week" className="space-y-4">
            {groupedRequests.thisWeek.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No new requests this week</h3>
                  <p className="text-sm text-muted-foreground mt-1">Add a new prayer request to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groupedRequests.thisWeek.map(request => (
                  <PrayerCard key={request.id} request={request} onUpdate={loadData} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="praying" className="space-y-4">
            {groupedRequests.praying.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <span className="text-6xl block mb-4">🙏</span>
                  <h3 className="text-lg font-medium text-muted-foreground">No active prayer requests</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groupedRequests.praying.map(request => (
                  <PrayerCard key={request.id} request={request} onUpdate={loadData} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="answered" className="space-y-4">
            {groupedRequests.answered.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <span className="text-6xl block mb-4">✅</span>
                  <h3 className="text-lg font-medium text-muted-foreground">No answered prayers yet</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groupedRequests.answered.map(request => (
                  <PrayerCard key={request.id} request={request} onUpdate={loadData} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="praises" className="space-y-4">
            {groupedRequests.praises.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <span className="text-6xl block mb-4">🙌</span>
                  <h3 className="text-lg font-medium text-muted-foreground">No praises to share yet</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groupedRequests.praises.map(request => (
                  <PrayerCard key={request.id} request={request} onUpdate={loadData} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-4">
            {groupedRequests.archived.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No archived requests</h3>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groupedRequests.archived.map(request => (
                  <PrayerCard key={request.id} request={request} onUpdate={loadData} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};