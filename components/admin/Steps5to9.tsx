'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateStep5Data, updateFoundationRequirement, updateFileWork } from '@/actions/site.actions';

interface Steps5to9Props {
  site: any;
}

export default function Steps5to9({ site }: Steps5to9Props) {
  const router = useRouter();

  // Step 5
  const [step5Form, setStep5Form] = useState({
    dcdbType: site.step5Data?.dcdbType || '', // Single String or Double String
    acdbAmpere: site.step5Data?.acdbAmpere || 0, // ACDB ampere value
  });
  const [isSaving5, setIsSaving5] = useState(false);

  // Foundation Requirement
  const [foundationForm, setFoundationForm] = useState({
    cement: site.foundationRequirement?.cement || 0,
    rodi: site.foundationRequirement?.rodi || 0,
    bajari: site.foundationRequirement?.bajari || 0,
  });
  const [isSavingFoundation, setIsSavingFoundation] = useState(false);

  // File Work
  const [fileWorkForm, setFileWorkForm] = useState({
    name: site.fileWork?.name || '',
    submitMeterForm: site.fileWork?.submitMeterForm || '',
    fileSubmitDate: site.fileWork?.fileSubmitDate ? new Date(site.fileWork.fileSubmitDate).toISOString().split('T')[0] : '',
    linemanNumber: site.fileWork?.linemanNumber || '',
  });
  const [isSavingFileWork, setIsSavingFileWork] = useState(false);

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

  const handleSaveFoundation = async () => {
    setIsSavingFoundation(true);
    try {
      const result = await updateFoundationRequirement(site._id, foundationForm);
      if (result.success) {
        toast.success('Foundation Requirement updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSavingFoundation(false);
    }
  };

  const handleSaveFileWork = async () => {
    setIsSavingFileWork(true);
    try {
      const result = await updateFileWork(site._id, fileWorkForm);
      if (result.success) {
        toast.success('File Work updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsSavingFileWork(false);
    }
  };

  const isStep5Complete = step5Form.dcdbType || step5Form.acdbAmpere > 0;
  const isFoundationComplete = foundationForm.cement > 0 || foundationForm.rodi > 0 || foundationForm.bajari > 0;
  const isFileWorkComplete = fileWorkForm.name || fileWorkForm.submitMeterForm || fileWorkForm.linemanNumber;

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
                  <Select value={step5Form.dcdbType} onValueChange={(value) => setStep5Form({...step5Form, dcdbType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
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
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0"
                    value={step5Form.acdbAmpere || ''} 
                    onChange={(e) => setStep5Form({...step5Form, acdbAmpere: parseInt(e.target.value) || 0})}
                    placeholder="Enter ampere value"
                    className="pr-20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    Ampere
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave5} disabled={isSaving5}>{isSaving5 ? 'Saving...' : 'Save DCDB & ACDB'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Foundation Requirement */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFoundationComplete ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isFoundationComplete ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">6</span>}
            </div>
            <div>
              <CardTitle>Foundation Requirement</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Foundation materials quantity</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2">
              <CardHeader><CardTitle className="text-lg">Cement</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0"
                    step="0.1"
                    value={foundationForm.cement || ''} 
                    onChange={(e) => setFoundationForm({...foundationForm, cement: parseFloat(e.target.value) || 0})}
                    placeholder="Enter quantity"
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    Bags
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader><CardTitle className="text-lg">Rodi</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0"
                    step="0.1"
                    value={foundationForm.rodi || ''} 
                    onChange={(e) => setFoundationForm({...foundationForm, rodi: parseFloat(e.target.value) || 0})}
                    placeholder="Enter quantity"
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    Tons
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader><CardTitle className="text-lg">Bajari</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <Input 
                    type="number" 
                    min="0"
                    step="0.1"
                    value={foundationForm.bajari || ''} 
                    onChange={(e) => setFoundationForm({...foundationForm, bajari: parseFloat(e.target.value) || 0})}
                    placeholder="Enter quantity"
                    className="pr-16"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                    Tons
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveFoundation} disabled={isSavingFoundation}>
              {isSavingFoundation ? 'Saving...' : 'Save Foundation Requirement'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Work */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFileWorkComplete ? 'bg-green-500' : 'bg-blue-500'}`}>
              {isFileWorkComplete ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">7</span>}
            </div>
            <div>
              <CardTitle>File Work</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">File submission and lineman details</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input 
                value={fileWorkForm.name} 
                onChange={(e) => setFileWorkForm({...fileWorkForm, name: e.target.value})}
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Submit Meter Form</label>
              <Input 
                value={fileWorkForm.submitMeterForm} 
                onChange={(e) => setFileWorkForm({...fileWorkForm, submitMeterForm: e.target.value})}
                placeholder="Enter meter form details"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">File Submit Date</label>
              <Input 
                type="date"
                value={fileWorkForm.fileSubmitDate} 
                onChange={(e) => setFileWorkForm({...fileWorkForm, fileSubmitDate: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Lineman Number</label>
              <Input 
                value={fileWorkForm.linemanNumber} 
                onChange={(e) => setFileWorkForm({...fileWorkForm, linemanNumber: e.target.value})}
                placeholder="Enter lineman number"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSaveFileWork} disabled={isSavingFileWork}>
              {isSavingFileWork ? 'Saving...' : 'Save File Work'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
