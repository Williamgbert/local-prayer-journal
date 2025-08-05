export interface PrayerRequest {
  id: string;
  memberName: string;
  category: 'health' | 'family' | 'work' | 'spiritual' | 'praise' | 'other';
  details: string;
  dateAdded: string;
  answerDate?: string;
  notes?: string;
  status: 'praying' | 'answered' | 'archived';
  highlight?: boolean; // for sharing
}

export interface PrayerData {
  requests: PrayerRequest[];
  members: string[];
  lastUpdated: string;
}

const STORAGE_KEY = 'prayer-tracker-data';

export class PrayerStorage {
  static getData(): PrayerData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading prayer data:', error);
    }
    
    return {
      requests: [],
      members: [],
      lastUpdated: new Date().toISOString()
    };
  }

  static saveData(data: PrayerData): void {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving prayer data:', error);
    }
  }

  static addRequest(request: Omit<PrayerRequest, 'id'>): void {
    const data = this.getData();
    const newRequest: PrayerRequest = {
      ...request,
      id: `pr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    data.requests.push(newRequest);
    
    // Add member to list if not exists
    if (!data.members.includes(request.memberName)) {
      data.members.push(request.memberName);
    }
    
    this.saveData(data);
  }

  static updateRequest(id: string, updates: Partial<PrayerRequest>): void {
    const data = this.getData();
    const index = data.requests.findIndex(r => r.id === id);
    
    if (index !== -1) {
      data.requests[index] = { ...data.requests[index], ...updates };
      this.saveData(data);
    }
  }

  static deleteRequest(id: string): void {
    const data = this.getData();
    data.requests = data.requests.filter(r => r.id !== id);
    this.saveData(data);
  }

  static exportData(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.requests && Array.isArray(imported.requests)) {
        this.saveData(imported);
        return true;
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
    return false;
  }

  static exportAsText(): string {
    const data = this.getData();
    let text = `Prayer Tracker Export - ${new Date().toLocaleDateString()}\n\n`;
    
    const groupedByStatus = {
      praying: data.requests.filter(r => r.status === 'praying'),
      answered: data.requests.filter(r => r.status === 'answered'),
      archived: data.requests.filter(r => r.status === 'archived')
    };

    Object.entries(groupedByStatus).forEach(([status, requests]) => {
      if (requests.length > 0) {
        text += `${status.toUpperCase()} REQUESTS:\n`;
        text += '='.repeat(20) + '\n\n';
        
        requests.forEach(request => {
          text += `${request.memberName} - ${request.category}\n`;
          text += `Added: ${new Date(request.dateAdded).toLocaleDateString()}\n`;
          text += `Request: ${request.details}\n`;
          if (request.answerDate) {
            text += `Answered: ${new Date(request.answerDate).toLocaleDateString()}\n`;
          }
          if (request.notes) {
            text += `Notes: ${request.notes}\n`;
          }
          text += '\n---\n\n';
        });
      }
    });

    return text;
  }
}

export const getCategoryIcon = (category: PrayerRequest['category']): string => {
  const icons = {
    health: '🏥',
    family: '👨‍👩‍👧‍👦',
    work: '💼',
    spiritual: '✝️',
    praise: '🙌',
    other: '💭'
  };
  return icons[category];
};

export const getStatusIcon = (status: PrayerRequest['status']): string => {
  const icons = {
    praying: '🙏',
    answered: '✅',
    archived: '📁'
  };
  return icons[status];
};