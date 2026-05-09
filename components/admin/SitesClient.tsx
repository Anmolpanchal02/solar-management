'use client';

import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Navigation } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { createSite, updateSite, deleteSite } from '@/actions/site.actions';
import { useRouter } from 'next/navigation';

interface Site {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  installationType: string;
  status: string;
  progressPercentage?: number;
  assignedEmployee?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface SitesClientProps {
  sites: Site[];
}

export default function SitesClient({ sites }: SitesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const filteredSites = sites.filter(
    (site) =>
      site.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleAdd = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      address: '',
      latitude: 0,
      longitude: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (site: Site) => {
    setSelectedSite(site);
    setFormData({
      customerName: site.customerName,
      customerPhone: site.customerPhone,
      address: site.address,
      latitude: 0,
      longitude: 0,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (site: Site) => {
    setSelectedSite(site);
    setIsDeleteDialogOpen(true);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGettingLocation(false);
        alert(`Location captured: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      },
      (error) => {
        setIsGettingLocation(false);
        alert('Unable to get location. Please enable location permissions.');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await createSite(formData);
      if (result.success) {
        setIsAddDialogOpen(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to create site');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;
    
    setIsLoading(true);
    
    try {
      const result = await updateSite(selectedSite._id, formData);
      if (result.success) {
        setIsEditDialogOpen(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to update site');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSite) return;
    
    setIsLoading(true);
    
    try {
      const result = await deleteSite(selectedSite._id);
      if (result.success) {
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to delete site');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites</h1>
          <p className="text-muted-foreground mt-1">Manage solar installation sites</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Site
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search sites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site) => (
              <Card 
                key={site._id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/admin/sites/${site._id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{site.customerName}</h3>
                    <Badge variant={getStatusColor(site.status)}>{site.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{site.address}</span>
                    </div>
                    {site.progressPercentage !== undefined && (
                      <p className="text-primary font-medium">
                        Progress: {site.progressPercentage}%
                      </p>
                    )}
                    {site.assignedEmployee && (
                      <p className="text-sm">
                        Assigned: {site.assignedEmployee.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(site);
                      }}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(site);
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredSites.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No sites found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Site Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Site</DialogTitle>
            <DialogDescription>
              Create a new solar installation site
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Customer Phone *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter complete address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                  </Button>
                  {formData.latitude !== 0 && formData.longitude !== 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <MapPin className="w-4 h-4" />
                      <span>Location Set</span>
                    </div>
                  )}
                </div>
                {formData.latitude !== 0 && formData.longitude !== 0 && (
                  <p className="text-xs text-muted-foreground">
                    Lat: {formData.latitude.toFixed(6)}, Long: {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Site'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Site Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
            <DialogDescription>
              Update site information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customerName">Customer Name *</Label>
                <Input
                  id="edit-customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-customerPhone">Customer Phone *</Label>
                <Input
                  id="edit-customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address *</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter complete address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                  </Button>
                  {formData.latitude !== 0 && formData.longitude !== 0 && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <MapPin className="w-4 h-4" />
                      <span>Location Set</span>
                    </div>
                  )}
                </div>
                {formData.latitude !== 0 && formData.longitude !== 0 && (
                  <p className="text-xs text-muted-foreground">
                    Lat: {formData.latitude.toFixed(6)}, Long: {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Site'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete site for {selectedSite?.customerName}? This action cannot be undone.
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
