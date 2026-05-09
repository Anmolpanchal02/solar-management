'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateStep5Data, updateStep6Data, updateStep7Data, updateStep8Data, updateStep9Data } from '@/actions/site.actions';

interface Steps5to9Props {
  site: any;
}

export default function Steps5to9({ site }: Steps5to9Props) {
  const router = useRouter();

  // Step 5
  const [step5Form, setStep5Form] = useState({
    dcdbType: site.step5Data?.dcdbType || '', // Single String or Double String
    acdbType: site.step5Data?.acdbType || '', // ACDB type if needed
  });
  const [isSaving5, setIsSaving5] = useState(false);

  // Step 6
  const [step6Form, setStep6Form] = useState({
    earthingType: site.step6Data?.earthingType || '',
    earthingDetails: site.step6Data?.earthingDetails || '',
    lightningArrester: site.step6Data?.lightningArrester || '',
  });
  const [isSaving6, setIsSaving6] = useState(false);

  // Step 7
  const [step7Form, setStep7Form] = useState({
    inverterBrand: site.step7Data?.inverterBrand || '',
    inverterCapacity: site.step7Data?.inverterCapacity || '',
    inverterModel: site.step7Data?.inverterModel || '',
    netMeterBrand: site.step7Data?.netMeterBrand || '',
    netMeterModel: site.step7Data?.netMeterModel || '',
  });
  const [isSaving7, setIsSaving7] = useState(false);

  // Step 8
  const [step8Form, setStep8Form] = useState({
    monitoringSystem: site.step8Data?.monitoringSystem || '',
    installationDate: site.step8Data?.installationDate ? new Date(site.step8Data.installationDate).toISOString().split('T')[0] : '',
    commissioningDate: site.step8Data?.commissioningDate ? new Date(site.step8Data.commissioningDate).toISOString().split('T')[0] : '',
  });
  const [isSaving8, setIsSaving8] = useState(false);

  // Step 9
  const [step9Form, setStep9Form] = useState({
    warrantyYears: site.step9Data?.warrantyYears || 0,
    warrantyDetails: site.step9Data?.warrantyDetails || '',
    otherAccessories: site.step9Data?.otherAccessories || '',
  });
  const [isSaving9, setIsSaving9] = useState(false);

  const handleSave5 = async () => {
    setIsSaving5(true);
    try {
      const result = await updateStep5Data(site._id, step5Form);
      if (result.success) {
        toast.success('DCDB & ACDB updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving5(false);
    }
  };

  const handleSave6 = async () => {
    setIsSaving6(true);
    try {
      const result = await updateStep6Data(site._id, step6Form);
      if (result.success) {
        toast.success('Earthing & Lightning updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving6(false);
    }
  };

  const handleSave7 = async () => {
    setIsSaving7(true);
    try {
      const result = await updateStep7Data(site._id, step7Form);
      if (result.success) {
        toast.success('Inverter & Net Meter updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving7(false);
    }
  };

  const handleSave8 = async () => {
    setIsSaving8(true);
    try {
      const result = await updateStep8Data(site._id, step8Form);
      if (result.success) {
        toast.success('Monitoring & Dates updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving8(false);
    }
  };

  const handleSave9 = async () => {
    setIsSaving9(true);
    try {
      const result = await updateStep9Data(site._id, step9Form);
      if (result.success) {
        toast.success('Warranty & Accessories updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSaving9(false);
    }
  };

  const isStep5Complete = step5Form.dcdbType || step5Form.acdbType;
  const isStep6Complete = step6Form.earthingType || step6Form.lightningArrester;
  const isStep7Complete = step7Form.inverterBrand || step7Form.netMeterBrand;
  const isStep8Complete = step8Form.monitoringSystem || step8Form.installationDate;
  const isStep9Complete = step9Form.warrantyYears > 0 || step9Form.otherAccessories;

  return (
    <>
      {/* Step 5: DCDB & ACDB */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isStep5Complete ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isStep5Complete ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">5</span>}
            </div>
            <div>
              <CardTitle>Step 5: DCDB & ACDB</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">DC and AC Distribution Box components</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader><CardTitle className="text-lg">DCDB</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select value={step5Form.dcdbType} onValueChange={(value) => setStep5Form({...step5Form, dcdbType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single String">Single String</SelectItem>
                      <SelectItem value="Double String">Double String</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader><CardTitle className="text-lg">ACDB</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select value={step5Form.acdbType} onValueChange={(value) => setStep5Form({...step5Form, acdbType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single Phase">Single Phase</SelectItem>
                      <SelectItem value="Three Phase">Three Phase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave5} disabled={isSaving5}>{isSaving5 ? 'Saving...' : 'Save DCDB & ACDB'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 6: Earthing & Lightning */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isStep6Complete ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isStep6Complete ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">6</span>}
            </div>
            <div>
              <CardTitle>Step 6: Earthing & Lightning</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Earthing system and lightning protection</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Earthing Type</Label><Input value={step6Form.earthingType} onChange={(e) => setStep6Form({...step6Form, earthingType: e.target.value})} placeholder="e.g., Plate earthing" /></div>
            <div><Label>Lightning Arrester</Label><Input value={step6Form.lightningArrester} onChange={(e) => setStep6Form({...step6Form, lightningArrester: e.target.value})} placeholder="Model/Details" /></div>
          </div>
          <div><Label>Earthing Details</Label><Textarea value={step6Form.earthingDetails} onChange={(e) => setStep6Form({...step6Form, earthingDetails: e.target.value})} placeholder="Additional earthing details" rows={3} /></div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave6} disabled={isSaving6}>{isSaving6 ? 'Saving...' : 'Save Earthing & Lightning'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 7: Inverter & Net Meter */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isStep7Complete ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isStep7Complete ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">7</span>}
            </div>
            <div>
              <CardTitle>Step 7: Inverter & Net Meter</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Inverter and net meter specifications</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader><CardTitle className="text-lg">Inverter</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Brand</Label><Input value={step7Form.inverterBrand} onChange={(e) => setStep7Form({...step7Form, inverterBrand: e.target.value})} placeholder="e.g., Growatt" /></div>
                <div><Label>Capacity</Label><Input value={step7Form.inverterCapacity} onChange={(e) => setStep7Form({...step7Form, inverterCapacity: e.target.value})} placeholder="e.g., 5 KW" /></div>
                <div><Label>Model</Label><Input value={step7Form.inverterModel} onChange={(e) => setStep7Form({...step7Form, inverterModel: e.target.value})} placeholder="Model number" /></div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader><CardTitle className="text-lg">Net Meter</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><Label>Brand</Label><Input value={step7Form.netMeterBrand} onChange={(e) => setStep7Form({...step7Form, netMeterBrand: e.target.value})} placeholder="Brand name" /></div>
                <div><Label>Model</Label><Input value={step7Form.netMeterModel} onChange={(e) => setStep7Form({...step7Form, netMeterModel: e.target.value})} placeholder="Model number" /></div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave7} disabled={isSaving7}>{isSaving7 ? 'Saving...' : 'Save Inverter & Net Meter'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 8: Monitoring & Dates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isStep8Complete ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isStep8Complete ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">8</span>}
            </div>
            <div>
              <CardTitle>Step 8: Monitoring & Dates</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Monitoring system and important dates</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Monitoring System</Label><Input value={step8Form.monitoringSystem} onChange={(e) => setStep8Form({...step8Form, monitoringSystem: e.target.value})} placeholder="e.g., WiFi monitoring" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Installation Date</Label><Input type="date" value={step8Form.installationDate} onChange={(e) => setStep8Form({...step8Form, installationDate: e.target.value})} /></div>
            <div><Label>Commissioning Date</Label><Input type="date" value={step8Form.commissioningDate} onChange={(e) => setStep8Form({...step8Form, commissioningDate: e.target.value})} /></div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave8} disabled={isSaving8}>{isSaving8 ? 'Saving...' : 'Save Monitoring & Dates'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 9: Warranty & Accessories */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isStep9Complete ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isStep9Complete ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">9</span>}
            </div>
            <div>
              <CardTitle>Step 9: Warranty & Accessories</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Warranty information and other accessories</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Warranty (Years)</Label><Input type="number" min="0" value={step9Form.warrantyYears} onChange={(e) => setStep9Form({...step9Form, warrantyYears: parseInt(e.target.value) || 0})} placeholder="e.g., 25" /></div>
            <div><Label>Warranty Details</Label><Input value={step9Form.warrantyDetails} onChange={(e) => setStep9Form({...step9Form, warrantyDetails: e.target.value})} placeholder="Warranty terms" /></div>
          </div>
          <div><Label>Other Accessories</Label><Textarea value={step9Form.otherAccessories} onChange={(e) => setStep9Form({...step9Form, otherAccessories: e.target.value})} placeholder="List any other accessories or components" rows={4} /></div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave9} disabled={isSaving9}>{isSaving9 ? 'Saving...' : 'Save Warranty & Accessories'}</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
