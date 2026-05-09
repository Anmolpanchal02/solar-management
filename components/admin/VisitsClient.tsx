'use client';

import { useState } from 'react';
import { Search, MapPin, User, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/helpers';
import { deleteVisit } from '@/actions/visit.actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Visit {
  _id: string;
  site: {
    _id: string;
    customerName: string;
    address: string;
  };
  employee: {
    _id: string;
    name: string;
  };
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
  notes?: string;
  workCompletionPercentage?: number;
  createdAt: string;
}

interface VisitsClientProps {
  visits: Visit[];
}

export default function VisitsClient({ visits }: VisitsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filteredVisits = visits.filter(
    (visit) =>
      visit.site.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleDelete = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedVisit) return;

    setIsLoading(true);

    try {
      const result = await deleteVisit(selectedVisit._id);
      if (result.success) {
        toast.success('Visit deleted successfully');
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete visit');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Visits</h1>
          <p className="text-muted-foreground mt-1">Track site visits and inspections</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search visits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredVisits.map((visit) => (
              <Card key={visit._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{visit.site.customerName}</h3>
                        <Badge variant={getStatusColor(visit.status)}>{visit.status}</Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{visit.site.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{visit.employee.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {visit.checkInTime && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Check-in: {formatDate(visit.checkInTime)}
                            </span>
                          )}
                          {visit.checkOutTime && (
                            <span className="flex items-center gap-1">
                              Check-out: {formatDate(visit.checkOutTime)}
                            </span>
                          )}
                        </div>
                        {visit.workCompletionPercentage !== undefined && (
                          <p className="text-primary font-medium">
                            Work Completion: {visit.workCompletionPercentage}%
                          </p>
                        )}
                        {visit.notes && (
                          <p className="text-muted-foreground mt-2">{visit.notes}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(visit)}>
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredVisits.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No visits found</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visit to {selectedVisit?.site.customerName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
