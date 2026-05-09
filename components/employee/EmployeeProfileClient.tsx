'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getInitials, formatDate } from '@/utils/helpers';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: string;
  createdAt: string;
}

interface EmployeeProfileClientProps {
  user: User;
}

export default function EmployeeProfileClient({ user }: EmployeeProfileClientProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
  });

  const handleSave = () => {
    // TODO: Implement update user profile action
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">View and update your profile</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-3xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
              <Badge className="mb-2">{user.role}</Badge>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
              <Button variant="outline" className="mt-4 w-full">
                <Edit className="w-4 h-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="font-medium">{user.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Phone
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <p className="font-medium">{user.phone || 'Not provided'}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">
                    Member Since
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Address
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                ) : (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <p className="font-medium">
                      {user.address || 'Not provided'}
                      {user.city && `, ${user.city}`}
                      {user.state && `, ${user.state}`}
                      {user.pincode && ` - ${user.pincode}`}
                    </p>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      City
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      State
                    </label>
                    <Input
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-1 block">
                      Pincode
                    </label>
                    <Input
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Current Password
              </label>
              <Input type="password" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                New Password
              </label>
              <Input type="password" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Confirm New Password
              </label>
              <Input type="password" />
            </div>
            <Button>Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
