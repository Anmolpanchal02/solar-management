'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Site {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: string;
  progressPercentage: number;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

interface EmployeeSitesClientProps {
  sites: Site[];
}

export default function EmployeeSitesClient({ sites }: EmployeeSitesClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = sites.filter(
    (site) =>
      site.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'secondary';
      case 'on-hold':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const openInMaps = (site: Site) => {
    if (site.location && site.location.coordinates[0] !== 0 && site.location.coordinates[1] !== 0) {
      // coordinates are [longitude, latitude] in MongoDB
      window.open(
        `https://www.google.com/maps?q=${site.location.coordinates[1]},${site.location.coordinates[0]}`,
        '_blank'
      );
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sites</h1>
        <p className="text-muted-foreground mt-1">View assigned sites</p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSites.map((site) => (
              <Card key={site._id} className="hover:shadow-lg transition-shadow">
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
                    <p className="text-primary font-medium">
                      Progress: {site.progressPercentage}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openInMaps(site)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Navigate
                    </Button>
                    <Link href={`/employee/sites/${site._id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
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
    </div>
  );
}
