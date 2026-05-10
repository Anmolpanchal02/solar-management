'use client';

import { ArrowLeft, MapPin, Phone, User, CheckCircle, Image as ImageIcon, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface EmployeeSiteDetailClientProps {
  site: any;
}

export default function EmployeeSiteDetailClient({ site }: EmployeeSiteDetailClientProps) {
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

  const openInMaps = () => {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employee/sites">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{site.customerName}</h1>
            <p className="text-muted-foreground mt-1">Site Details</p>
          </div>
        </div>
        <Badge variant={getStatusColor(site.status)} className="text-lg px-4 py-2">
          {site.status}
        </Badge>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-medium">{site.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{site.customerPhone}</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-1" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{site.address}</p>
            </div>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={openInMaps}
              className="w-full"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navigate to Site
            </Button>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Progress</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${site.progressPercentage}%` }}
                />
              </div>
              <span className="font-semibold">{site.progressPercentage}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Documents */}
      {site.step1Documents && (site.step1Documents.billImage || site.step1Documents.aadharImage || site.step1Documents.cancelledChequeImage) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 1: Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {site.step1Documents.billImage && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Bill</p>
                  <a href={site.step1Documents.billImage} target="_blank" rel="noopener noreferrer">
                    <img src={site.step1Documents.billImage} alt="Bill" className="w-full h-40 object-cover rounded" />
                  </a>
                </div>
              )}
              {site.step1Documents.aadharImage && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Aadhar Card</p>
                  <a href={site.step1Documents.aadharImage} target="_blank" rel="noopener noreferrer">
                    <img src={site.step1Documents.aadharImage} alt="Aadhar" className="w-full h-40 object-cover rounded" />
                  </a>
                </div>
              )}
              {site.step1Documents.cancelledChequeImage && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Cancelled Cheque</p>
                  <a href={site.step1Documents.cancelledChequeImage} target="_blank" rel="noopener noreferrer">
                    <img src={site.step1Documents.cancelledChequeImage} alt="Cheque" className="w-full h-40 object-cover rounded" />
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Kilowatt */}
      {site.step2Data && site.step2Data.kilowatt > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 2: Kilowatt (KW)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-5xl font-bold text-blue-600">{site.step2Data.kilowatt} KW</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Material Requirements */}
      {site.step3Data && site.step3Data.structure && site.step3Data.structure.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 3: Material Requirements - Structure</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {site.step3Data.structure.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.size}</span>
                  <span className="text-muted-foreground">{item.numberOfPipes} pipes</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Panel & Wire */}
      {site.step4Data && (site.step4Data.moduleWatt > 0 || site.step4Data.dcWireLength > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 4: Panel & Wire</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Module</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Watt:</span>
                    <span className="font-medium">{site.step4Data.moduleWatt}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{site.step4Data.moduleQuantity}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Wire Length</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DC Wire:</span>
                    <span className="font-medium">{site.step4Data.dcWireLength}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AC Wire:</span>
                    <span className="font-medium">{site.step4Data.acWireLength}m</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: DCDB & ACDB */}
      {site.step5Data && (site.step5Data.dcdbType || site.step5Data.acdbAmpere > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 5: DCDB & ACDB</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {site.step5Data.dcdbType && (
                <div>
                  <p className="text-sm text-muted-foreground">DCDB Type</p>
                  <p className="font-medium">{site.step5Data.dcdbType}</p>
                </div>
              )}
              {site.step5Data.acdbAmpere > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">ACDB</p>
                  <p className="font-medium">{site.step5Data.acdbAmpere} Ampere</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Earthing & Lightning */}
      {site.step6Data && (site.step6Data.earthingType || site.step6Data.lightningArrester) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 6: Earthing & Lightning</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {site.step6Data.earthingType && (
              <div>
                <p className="text-sm text-muted-foreground">Earthing Type</p>
                <p className="font-medium">{site.step6Data.earthingType}</p>
              </div>
            )}
            {site.step6Data.earthingDetails && (
              <div>
                <p className="text-sm text-muted-foreground">Earthing Details</p>
                <p className="font-medium">{site.step6Data.earthingDetails}</p>
              </div>
            )}
            {site.step6Data.lightningArrester && (
              <div>
                <p className="text-sm text-muted-foreground">Lightning Arrester</p>
                <p className="font-medium">{site.step6Data.lightningArrester}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 7: Inverter & Net Meter */}
      {site.step7Data && (site.step7Data.inverterBrand || site.step7Data.netMeterBrand) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 7: Inverter & Net Meter</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {site.step7Data.inverterBrand && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Inverter</h3>
                  <div className="space-y-1">
                    <div><span className="text-muted-foreground">Brand:</span> {site.step7Data.inverterBrand}</div>
                    {site.step7Data.inverterCapacity && <div><span className="text-muted-foreground">Capacity:</span> {site.step7Data.inverterCapacity}</div>}
                    {site.step7Data.inverterModel && <div><span className="text-muted-foreground">Model:</span> {site.step7Data.inverterModel}</div>}
                  </div>
                </div>
              )}
              {site.step7Data.netMeterBrand && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Net Meter</h3>
                  <div className="space-y-1">
                    <div><span className="text-muted-foreground">Brand:</span> {site.step7Data.netMeterBrand}</div>
                    {site.step7Data.netMeterModel && <div><span className="text-muted-foreground">Model:</span> {site.step7Data.netMeterModel}</div>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 8: Monitoring & Dates */}
      {site.step8Data && (site.step8Data.monitoringSystem || site.step8Data.installationDate) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 8: Monitoring & Dates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {site.step8Data.monitoringSystem && (
              <div>
                <p className="text-sm text-muted-foreground">Monitoring System</p>
                <p className="font-medium">{site.step8Data.monitoringSystem}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {site.step8Data.installationDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Installation Date</p>
                  <p className="font-medium">{new Date(site.step8Data.installationDate).toLocaleDateString()}</p>
                </div>
              )}
              {site.step8Data.commissioningDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Commissioning Date</p>
                  <p className="font-medium">{new Date(site.step8Data.commissioningDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 9: Warranty & Accessories */}
      {site.step9Data && (site.step9Data.warrantyYears > 0 || site.step9Data.otherAccessories) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Step 9: Warranty & Accessories</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {site.step9Data.warrantyYears > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Warranty</p>
                <p className="font-medium">{site.step9Data.warrantyYears} Years</p>
                {site.step9Data.warrantyDetails && <p className="text-sm text-muted-foreground mt-1">{site.step9Data.warrantyDetails}</p>}
              </div>
            )}
            {site.step9Data.otherAccessories && (
              <div>
                <p className="text-sm text-muted-foreground">Other Accessories</p>
                <p className="font-medium whitespace-pre-wrap">{site.step9Data.otherAccessories}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Foundation Requirement */}
      {site.foundationRequirement && (site.foundationRequirement.cement > 0 || site.foundationRequirement.rodi > 0 || site.foundationRequirement.bajari > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Foundation Requirement</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {site.foundationRequirement.cement > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Cement</p>
                  <p className="font-medium">{site.foundationRequirement.cement} Bags</p>
                </div>
              )}
              {site.foundationRequirement.rodi > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Rodi</p>
                  <p className="font-medium">{site.foundationRequirement.rodi} Tons</p>
                </div>
              )}
              {site.foundationRequirement.bajari > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Bajari</p>
                  <p className="font-medium">{site.foundationRequirement.bajari} Tons</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Work */}
      {site.fileWork && (site.fileWork.name || site.fileWork.submitMeterForm || site.fileWork.linemanNumber) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle>File Work</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {site.fileWork.name && (
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{site.fileWork.name}</p>
                </div>
              )}
              {site.fileWork.submitMeterForm && (
                <div>
                  <p className="text-sm text-muted-foreground">Submit Meter Form</p>
                  <p className="font-medium">{site.fileWork.submitMeterForm}</p>
                </div>
              )}
              {site.fileWork.fileSubmitDate && (
                <div>
                  <p className="text-sm text-muted-foreground">File Submit Date</p>
                  <p className="font-medium">{new Date(site.fileWork.fileSubmitDate).toLocaleDateString()}</p>
                </div>
              )}
              {site.fileWork.linemanNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Lineman Number</p>
                  <p className="font-medium">{site.fileWork.linemanNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
