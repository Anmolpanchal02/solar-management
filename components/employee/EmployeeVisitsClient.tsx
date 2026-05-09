'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/helpers';

interface Visit {
  _id: string;
  site: {
    customerName: string;
    address: string;
  };
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
  photos?: string[];
  createdAt: string;
}

interface EmployeeVisitsClientProps {
  visits: Visit[];
  userId: string;
}

export default function EmployeeVisitsClient({ visits, userId }: EmployeeVisitsClientProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'scheduled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const activeVisit = visits.find((v) => v.status === 'in-progress');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Visits</h1>
        <p className="text-muted-foreground mt-1">Track your site visits</p>
      </div>

      {activeVisit && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle className="text-primary">Active Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{activeVisit.site.customerName}</h3>
                <p className="text-sm text-muted-foreground">{activeVisit.site.address}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  Checked in at:{' '}
                  {activeVisit.checkIn
                    ? new Date(activeVisit.checkIn).toLocaleTimeString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Camera className="w-3 h-3 mr-1" />
                  Add Photos
                </Button>
                <Button size="sm">Check Out</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Visit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {visits.map((visit) => (
              <Card key={visit._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{visit.site.customerName}</h3>
                        <Badge variant={getStatusColor(visit.status)}>{visit.status}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{visit.site.address}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {visit.checkIn && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(visit.checkIn)}
                            </span>
                          )}
                          {visit.checkIn && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(visit.checkIn).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        {visit.notes && (
                          <p className="text-muted-foreground mt-2">{visit.notes}</p>
                        )}
                        {visit.photos && visit.photos.length > 0 && (
                          <div className="flex items-center gap-1 text-primary">
                            <Camera className="w-4 h-4" />
                            <span>{visit.photos.length} photos</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {visits.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No visits found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
