'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, MapPin, User, CheckCircle, ImagePlus, X, Eye, Download, Trash2, Plus, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateStep1Documents, updateStep2Data, updateStep3Data, updateStep4Data } from '@/actions/site.actions';
import Steps5to9 from './Steps5to9';

interface Site {
  _id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: string;
  progressPercentage?: number;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  assignedEmployee?: {
    _id: string;
    name: string;
  };
  step1Documents?: {
    billImage?: string;
    aadharImage?: string;
    cancelledChequeImage?: string;
    uploadedBy?: string;
    uploadedAt?: string;
  };
  step2Data?: {
    kilowatt?: number;
    updatedBy?: string;
    updatedAt?: string;
  };
  step3Data?: {
    structure?: Array<{
      size: string;
      numberOfPipes: number;
    }>;
    updatedBy?: string;
    updatedAt?: string;
  };
  step4Data?: {
    moduleWatt?: number;
    moduleQuantity?: number;
    dcWireLength?: number;
    acWireLength?: number;
    updatedBy?: string;
    updatedAt?: string;
  };
  createdAt: string;
}

interface SiteDetailClientProps {
  site: Site;
}

export default function SiteDetailClient({ site }: SiteDetailClientProps) {
  const router = useRouter();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [fullViewImage, setFullViewImage] = useState<{ url: string; title: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ field: 'billImage' | 'aadharImage' | 'cancelledChequeImage'; title: string } | null>(null);
  const [kilowatt, setKilowatt] = useState(site.step2Data?.kilowatt || 0);
  const [isSavingKW, setIsSavingKW] = useState(false);
  
  // Structure items - start with 1 row, add more with Plus button
  // Store width and height separately, combine to size on save
  const [structureItems, setStructureItems] = useState<Array<{ width: string; height: string; numberOfPipes: number }>>(
    () => {
      if (site.step3Data?.structure && site.step3Data.structure.length > 0) {
        return site.step3Data.structure.map(item => {
          // Parse "75*75 mm" to width and height
          const match = item.size.match(/(\d+)\s*[×*]\s*(\d+)/);
          if (match) {
            return {
              width: match[1],
              height: match[2],
              numberOfPipes: item.numberOfPipes
            };
          }
          return { width: '', height: '', numberOfPipes: item.numberOfPipes };
        });
      }
      return [{ width: '', height: '', numberOfPipes: 0 }];
    }
  );
  
  const [isSavingStructure, setIsSavingStructure] = useState(false);

  // Step 4: Panel & Wire
  const [step4Form, setStep4Form] = useState({
    moduleWatt: site.step4Data?.moduleWatt || 0,
    moduleQuantity: site.step4Data?.moduleQuantity || 0,
    dcWireLength: site.step4Data?.dcWireLength || 0,
    acWireLength: site.step4Data?.acWireLength || 0,
  });
  const [isSavingStep4, setIsSavingStep4] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{ latitude: number; longitude: number } | null>(() => {
    // Initialize from site location if exists
    if (site.location && site.location.coordinates[0] !== 0 && site.location.coordinates[1] !== 0) {
      return {
        latitude: site.location.coordinates[1],  // MongoDB stores [longitude, latitude]
        longitude: site.location.coordinates[0]
      };
    }
    return null;
  });

  const billInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);
  const chequeInputRef = useRef<HTMLInputElement>(null);

  const [docForm, setDocForm] = useState({
    billImage: site.step1Documents?.billImage || '',
    aadharImage: site.step1Documents?.aadharImage || '',
    cancelledChequeImage: site.step1Documents?.cancelledChequeImage || '',
  });

  const [previews, setPreviews] = useState({
    billImage: site.step1Documents?.billImage || '',
    aadharImage: site.step1Documents?.aadharImage || '',
    cancelledChequeImage: site.step1Documents?.cancelledChequeImage || '',
  });

  const [fileNames, setFileNames] = useState({
    billImage: '',
    aadharImage: '',
    cancelledChequeImage: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload error:', errorData);
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'billImage' | 'aadharImage' | 'cancelledChequeImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingField(field);

    try {
      // Store file name
      setFileNames(prev => ({ ...prev, [field]: file.name }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      setDocForm(prev => ({ ...prev, [field]: imageUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      setPreviews(prev => ({ ...prev, [field]: '' }));
      setFileNames(prev => ({ ...prev, [field]: '' }));
    } finally {
      setUploadingField(null);
    }
  };

  const removeImage = (field: 'billImage' | 'aadharImage' | 'cancelledChequeImage') => {
    setDocForm(prev => ({ ...prev, [field]: '' }));
    setPreviews(prev => ({ ...prev, [field]: '' }));
    setFileNames(prev => ({ ...prev, [field]: '' }));
  };

  const handleDownload = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteConfirm) return;

    setIsLoading(true);
    try {
      // Create update object with only the field to delete
      const updateData: any = {};
      updateData[deleteConfirm.field] = ''; // Set to empty string to delete

      const result = await updateStep1Documents(site._id, updateData);

      if (result.success) {
        toast.success(`${deleteConfirm.title} deleted successfully`);
        setDeleteConfirm(null);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to delete document');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKilowatt = async () => {
    setIsSavingKW(true);
    try {
      console.log('Saving kilowatt:', kilowatt, 'for site:', site._id);
      const result = await updateStep2Data(site._id, kilowatt);
      console.log('Result:', result);

      if (result.success) {
        toast.success('Kilowatt updated successfully');
        router.refresh();
      } else {
        console.error('Error:', result.error);
        toast.error(result.error || 'Failed to update kilowatt');
      }
    } catch (error) {
      console.error('Exception:', error);
      toast.error('An error occurred');
    } finally {
      setIsSavingKW(false);
    }
  };

  const updateStructureItem = (index: number, field: 'numberOfPipes', value: number) => {
    const updated = [...structureItems];
    updated[index] = { ...updated[index], [field]: value };
    setStructureItems(updated);
  };

  const updateStructureDimension = (index: number, field: 'width' | 'height', value: string) => {
    const updated = [...structureItems];
    updated[index] = { ...updated[index], [field]: value };
    setStructureItems(updated);
  };

  const addStructureRow = () => {
    setStructureItems([...structureItems, { width: '', height: '', numberOfPipes: 0 }]);
  };

  const removeStructureRow = (index: number) => {
    if (structureItems.length === 1) {
      toast.error('At least one row is required');
      return;
    }
    setStructureItems(structureItems.filter((_, i) => i !== index));
  };

  const handleSaveStructure = async () => {
    // Convert width×height to size format and filter valid items
    const validItems = structureItems
      .filter(item => item.width && item.height && item.numberOfPipes > 0)
      .map(item => ({
        size: `${item.width}×${item.height} mm`,
        numberOfPipes: item.numberOfPipes
      }));

    console.log('Step 3 - Structure items:', structureItems);
    console.log('Step 3 - Valid items:', validItems);

    if (validItems.length === 0) {
      toast.error('Please add at least one pipe with size and quantity');
      return;
    }

    setIsSavingStructure(true);
    try {
      const result = await updateStep3Data(site._id, validItems);
      console.log('Step 3 - Result:', result);

      if (result.success) {
        toast.success('Material requirements updated successfully');
        router.refresh();
      } else {
        console.error('Step 3 - Error:', result.error);
        toast.error(result.error || 'Failed to update material requirements');
      }
    } catch (error) {
      console.error('Step 3 - Exception:', error);
      toast.error('An error occurred');
    } finally {
      setIsSavingStructure(false);
    }
  };

  const handleSaveStep4 = async () => {
    console.log('Step 4 - Saving data:', step4Form);
    setIsSavingStep4(true);
    try {
      const result = await updateStep4Data(site._id, step4Form);
      console.log('Step 4 - Result:', result);

      if (result.success) {
        toast.success('Panel & Wire data updated successfully');
        router.refresh();
      } else {
        console.error('Step 4 - Error:', result.error);
        toast.error(result.error || 'Failed to update panel & wire data');
      }
    } catch (error) {
      console.error('Step 4 - Exception:', error);
      toast.error('An error occurred');
    } finally {
      setIsSavingStep4(false);
    }
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        setLocationData({ latitude, longitude });
        
        // Save location to database
        try {
          const { updateSite } = await import('@/actions/site.actions');
          const result = await updateSite(site._id, { latitude, longitude });
          
          if (result.success) {
            toast.success(`Location saved: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            router.refresh();
          } else {
            toast.error('Failed to save location');
          }
        } catch (error) {
          toast.error('Failed to save location');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error('Unable to get location. Please enable location permissions.');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleUploadDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateStep1Documents(site._id, docForm);

      if (result.success) {
        toast.success('Documents uploaded successfully');
        setIsUploadDialogOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to upload documents');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Complete = 
    site.step1Documents?.billImage && 
    site.step1Documents?.aadharImage && 
    site.step1Documents?.cancelledChequeImage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/sites')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{site.customerName}</h1>
          <p className="text-muted-foreground mt-1">Site Details & Documentation</p>
        </div>
        <Badge variant={getStatusColor(site.status)}>{site.status}</Badge>
      </div>

      {/* Site Info */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Customer Name</Label>
              <p className="font-medium">{site.customerName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="font-medium">{site.customerPhone}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-muted-foreground">Address</Label>
              <p className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {site.address}
              </p>
            </div>
            {site.assignedEmployee && (
              <div>
                <Label className="text-muted-foreground">Assigned Employee</Label>
                <p className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {site.assignedEmployee.name}
                </p>
              </div>
            )}
            {site.progressPercentage !== undefined && (
              <div>
                <Label className="text-muted-foreground">Progress</Label>
                <p className="font-medium text-primary">{site.progressPercentage}%</p>
              </div>
            )}
            <div className="col-span-2">
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isGettingLocation ? 'Getting Location...' : (locationData ? 'Update Current Location' : 'Add Current Location')}
              </Button>
              {locationData && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location saved: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="200"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${locationData.latitude},${locationData.longitude}&zoom=15`}
                      allowFullScreen
                    />
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => window.open(`https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`, '_blank')}
                  >
                    Open in Google Maps
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isStep1Complete ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {isStep1Complete ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-bold">1</span>
                )}
              </div>
              <div>
                <CardTitle>Step 1: Upload Documents</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Bill, Aadhar Card, and Cancelled Cheque
                </p>
              </div>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              {isStep1Complete ? 'Update Documents' : 'Upload Documents'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bill Image */}
            {site.step1Documents?.billImage ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={site.step1Documents.billImage}
                        alt="Bill"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setFullViewImage({ url: site.step1Documents!.billImage!, title: 'Bill' })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(site.step1Documents!.billImage!, 'bill.jpg')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteConfirm({ field: 'billImage', title: 'Bill' })}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Bill
                      </h4>
                      {site.step1Documents.uploadedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded by {site.step1Documents.uploadedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors h-48 flex flex-col items-center justify-center"
                  >
                    <ImagePlus className="w-10 h-10 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Bill</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aadhar Card Image */}
            {site.step1Documents?.aadharImage ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={site.step1Documents.aadharImage}
                        alt="Aadhar Card"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setFullViewImage({ url: site.step1Documents!.aadharImage!, title: 'Aadhar Card' })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(site.step1Documents!.aadharImage!, 'aadhar_card.jpg')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteConfirm({ field: 'aadharImage', title: 'Aadhar Card' })}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Aadhar Card
                      </h4>
                      {site.step1Documents.uploadedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded by {site.step1Documents.uploadedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors h-48 flex flex-col items-center justify-center"
                  >
                    <ImagePlus className="w-10 h-10 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Aadhar Card</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled Cheque Image */}
            {site.step1Documents?.cancelledChequeImage ? (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="relative group">
                      <img
                        src={site.step1Documents.cancelledChequeImage}
                        alt="Cancelled Cheque"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setFullViewImage({ url: site.step1Documents!.cancelledChequeImage!, title: 'Cancelled Cheque' })}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(site.step1Documents!.cancelledChequeImage!, 'cancelled_cheque.jpg')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteConfirm({ field: 'cancelledChequeImage', title: 'Cancelled Cheque' })}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Cancelled Cheque
                      </h4>
                      {site.step1Documents.uploadedBy && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Uploaded by {site.step1Documents.uploadedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <div
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors h-48 flex flex-col items-center justify-center"
                  >
                    <ImagePlus className="w-10 h-10 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Cancelled Cheque</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to upload</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Kilowatt */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                site.step2Data?.kilowatt ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {site.step2Data?.kilowatt ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-bold">2</span>
                )}
              </div>
              <div>
                <CardTitle>Step 2: Set Kilowatt (KW)</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Select power capacity from 0 to 50 KW
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Current Value Display */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {kilowatt}
                <span className="text-2xl ml-2">KW</span>
              </div>
              {site.step2Data?.updatedBy && (
                <p className="text-sm text-muted-foreground mt-2">
                  Last updated by {site.step2Data.updatedBy}
                </p>
              )}
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={kilowatt}
                onChange={(e) => setKilowatt(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(kilowatt / 50) * 100}%, rgb(229, 231, 235) ${(kilowatt / 50) * 100}%, rgb(229, 231, 235) 100%)`
                }}
              />
              
              {/* Scale Labels */}
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>0 KW</span>
                <span>10 KW</span>
                <span>20 KW</span>
                <span>30 KW</span>
                <span>40 KW</span>
                <span>50 KW</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveKilowatt}
                disabled={isSavingKW || kilowatt === (site.step2Data?.kilowatt || 0)}
              >
                {isSavingKW ? 'Saving...' : 'Save Kilowatt'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Material Requirements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                site.step3Data?.structure && site.step3Data.structure.length > 0 ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {site.step3Data?.structure && site.step3Data.structure.length > 0 ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-bold">3</span>
                )}
              </div>
              <div>
                <CardTitle>Step 3: Material Requirements</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Structure - Pipe Quantity
                </p>
              </div>
            </div>
            <Button onClick={addStructureRow} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Row
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {structureItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="number"
                    min="0"
                    value={item.width || ''}
                    onChange={(e) => updateStructureDimension(index, 'width', e.target.value)}
                    placeholder="75"
                    className="text-center text-lg font-semibold w-20"
                  />
                  <span className="text-2xl font-bold text-muted-foreground">×</span>
                  <Input
                    type="number"
                    min="0"
                    value={item.height || ''}
                    onChange={(e) => updateStructureDimension(index, 'height', e.target.value)}
                    placeholder="75"
                    className="text-center text-lg font-semibold w-20"
                  />
                  <span className="text-lg font-semibold text-muted-foreground">mm</span>
                </div>
                <div className="w-40">
                  <Input
                    type="number"
                    min="0"
                    value={item.numberOfPipes}
                    onChange={(e) => updateStructureItem(index, 'numberOfPipes', parseInt(e.target.value) || 0)}
                    placeholder="Quantity"
                    className="text-center text-lg"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStructureRow(index)}
                  disabled={structureItems.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {site.step3Data?.updatedBy && (
                <p>Last updated by {site.step3Data.updatedBy}</p>
              )}
            </div>
            <Button 
              onClick={handleSaveStructure}
              disabled={isSavingStructure}
            >
              {isSavingStructure ? 'Saving...' : 'Save Material Requirements'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Panel & Wire */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              site.step4Data?.moduleWatt || site.step4Data?.dcWireLength || site.step4Data?.acWireLength ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {site.step4Data?.moduleWatt || site.step4Data?.dcWireLength || site.step4Data?.acWireLength ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <span className="text-white font-bold">4</span>
              )}
            </div>
            <div>
              <CardTitle>Step 4: Panel & Wire</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Module specifications and wire lengths
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Module Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="moduleWatt">Watt</Label>
                  <Input
                    id="moduleWatt"
                    type="number"
                    min="0"
                    value={step4Form.moduleWatt}
                    onChange={(e) => setStep4Form({ ...step4Form, moduleWatt: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 550"
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="moduleQuantity">Quantity</Label>
                  <Input
                    id="moduleQuantity"
                    type="number"
                    min="0"
                    value={step4Form.moduleQuantity}
                    onChange={(e) => setStep4Form({ ...step4Form, moduleQuantity: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 10"
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Wire Section */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Wire Length</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="dcWireLength">DC Wire (meters)</Label>
                  <Input
                    id="dcWireLength"
                    type="number"
                    min="0"
                    value={step4Form.dcWireLength}
                    onChange={(e) => setStep4Form({ ...step4Form, dcWireLength: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 50"
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="acWireLength">AC Wire (meters)</Label>
                  <Input
                    id="acWireLength"
                    type="number"
                    min="0"
                    value={step4Form.acWireLength}
                    onChange={(e) => setStep4Form({ ...step4Form, acWireLength: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 30"
                    className="text-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {site.step4Data?.updatedBy && (
                <p>Last updated by {site.step4Data.updatedBy}</p>
              )}
            </div>
            <Button 
              onClick={handleSaveStep4}
              disabled={isSavingStep4}
            >
              {isSavingStep4 ? 'Saving...' : 'Save Panel & Wire Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Steps 5-9 */}
      <Steps5to9 site={site} />

      {/* Upload Documents Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Step 1: Upload Documents</DialogTitle>
            <DialogDescription>
              Upload Bill, Aadhar Card, and Cancelled Cheque images
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadDocuments}>
            <div className="space-y-6 py-4">
              {/* Bill Image */}
              <div className="space-y-3">
                <Label>Bill Image</Label>
                <input
                  ref={billInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'billImage')}
                />
                {previews.billImage ? (
                  <div className="relative">
                    <img
                      src={previews.billImage}
                      alt="Bill preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage('billImage')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {fileNames.billImage && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                        <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {fileNames.billImage}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => billInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <ImagePlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload Bill</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG (any size)</p>
                  </div>
                )}
                {uploadingField === 'billImage' && (
                  <p className="text-sm text-blue-600">Uploading...</p>
                )}
              </div>

              {/* Aadhar Card Image */}
              <div className="space-y-3">
                <Label>Aadhar Card Image</Label>
                <input
                  ref={aadharInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'aadharImage')}
                />
                {previews.aadharImage ? (
                  <div className="relative">
                    <img
                      src={previews.aadharImage}
                      alt="Aadhar preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage('aadharImage')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {fileNames.aadharImage && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                        <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {fileNames.aadharImage}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => aadharInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <ImagePlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload Aadhar Card</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG (any size)</p>
                  </div>
                )}
                {uploadingField === 'aadharImage' && (
                  <p className="text-sm text-blue-600">Uploading...</p>
                )}
              </div>

              {/* Cancelled Cheque Image */}
              <div className="space-y-3">
                <Label>Cancelled Cheque Image</Label>
                <input
                  ref={chequeInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'cancelledChequeImage')}
                />
                {previews.cancelledChequeImage ? (
                  <div className="relative">
                    <img
                      src={previews.cancelledChequeImage}
                      alt="Cheque preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => removeImage('cancelledChequeImage')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {fileNames.cancelledChequeImage && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                        <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {fileNames.cancelledChequeImage}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => chequeInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <ImagePlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload Cancelled Cheque</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG (any size)</p>
                  </div>
                )}
                {uploadingField === 'cancelledChequeImage' && (
                  <p className="text-sm text-blue-600">Uploading...</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || uploadingField !== null || (!docForm.billImage && !docForm.aadharImage && !docForm.cancelledChequeImage)}
              >
                {isLoading ? 'Saving...' : 'Save Documents'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Full View Image Dialog */}
      <Dialog open={!!fullViewImage} onOpenChange={() => setFullViewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{fullViewImage?.title}</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {fullViewImage && (
              <img
                src={fullViewImage.url}
                alt={fullViewImage.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFullViewImage(null)}
            >
              Close
            </Button>
            {fullViewImage && (
              <Button
                onClick={() => handleDownload(fullViewImage.url, `${fullViewImage.title.toLowerCase().replace(/\s+/g, '_')}.jpg`)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteConfirm?.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
              You can upload a new document later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
