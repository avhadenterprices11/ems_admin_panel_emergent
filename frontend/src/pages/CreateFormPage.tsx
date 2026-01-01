import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, Trash2, GripVertical, Plus, Settings,
  AlertCircle, CheckCircle2, ChevronDown, X, Copy,
  Lock, Zap, GitBranch, Users, Clock, Bell, Mail, Webhook,
  FileText, Database, Shield, AlertTriangle
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { toast } from 'sonner';
import { AssignmentRulesBuilder } from '../components/AssignmentRulesBuilder';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  validationRules?: string[];
  isPII?: boolean;
  editableBy?: string[];
}

interface WorkflowStage {
  id: string;
  name: string;
  roles: string[];
  approvalRequired: boolean;
}

interface DraggableFieldProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  moveField: (dragIndex: number, hoverIndex: number) => void;
}

const fieldLibrary = {
  basic: [
    { type: 'text', label: 'Text Input', icon: FileText },
    { type: 'textarea', label: 'Long Text', icon: FileText },
    { type: 'number', label: 'Number', icon: FileText },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'phone', label: 'Phone', icon: FileText },
    { type: 'date', label: 'Date', icon: Clock },
    { type: 'dropdown', label: 'Dropdown', icon: ChevronDown },
    { type: 'checkbox', label: 'Checkbox', icon: CheckCircle2 },
    { type: 'radio', label: 'Radio Group', icon: CheckCircle2 },
  ],
  advanced: [
    { type: 'file', label: 'File Upload', icon: FileText },
    { type: 'multi-select', label: 'Multi-Select', icon: CheckCircle2 },
    { type: 'rating', label: 'Rating', icon: FileText },
    { type: 'signature', label: 'Signature', icon: FileText },
    { type: 'address', label: 'Address', icon: FileText },
  ],
  identity: [
    { type: 'person-lookup', label: 'Person Lookup', icon: Users },
    { type: 'organization', label: 'Organization', icon: Users },
    { type: 'role', label: 'Role Selector', icon: Shield },
  ],
  system: [
    { type: 'calculated', label: 'Calculated Field', icon: Database },
    { type: 'conditional', label: 'Conditional Logic', icon: GitBranch },
    { type: 'hidden', label: 'Hidden Field', icon: Lock },
  ],
};

const DraggableField = ({ field, index, isSelected, onSelect, onRemove, onDuplicate, moveField }: DraggableFieldProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'FIELD',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD',
    item: () => ({ id: field.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      onClick={onSelect}
      className={`group border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50/50 shadow-sm'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-4 w-4 text-slate-300 mt-1 cursor-grab active:cursor-grabbing" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-slate-900">
              {field.label}
            </span>
            {field.required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
            {field.isPII && (
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                <Shield className="h-3 w-3 mr-1" />
                PII
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {field.type.replace('-', ' ').charAt(0).toUpperCase() + 
             field.type.replace('-', ' ').slice(1)}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export function CreateFormPage() {
  const navigate = useNavigate();
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState('');
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [workflowEnabled, setWorkflowEnabled] = useState(false);
  const [assignmentType, setAssignmentType] = useState('manual');
  const [workflowStages, setWorkflowStages] = useState<WorkflowStage[]>([
    { id: '1', name: 'Draft', roles: ['applicant'], approvalRequired: false },
    { id: '2', name: 'Review', roles: ['reviewer'], approvalRequired: true },
    { id: '3', name: 'Approved', roles: ['admin'], approvalRequired: true },
  ]);

  const handleAddField = (fieldType: string, fieldLabel: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: fieldLabel,
      required: false,
      editableBy: ['admin', 'applicant'],
    };
    setFormFields([...formFields, newField]);
    setSelectedField(newField);
    toast.success(`Added ${fieldLabel}`);
  };

  const handleRemoveField = (fieldId: string) => {
    setFormFields(formFields.filter(f => f.id !== fieldId));
    if (selectedField?.id === fieldId) setSelectedField(null);
  };

  const handleDuplicateField = (field: FormField) => {
    const duplicate = { 
      ...field, 
      id: `field-${Date.now()}`, 
      label: `${field.label} (Copy)` 
    };
    setFormFields([...formFields, duplicate]);
  };

  const moveField = (dragIndex: number, hoverIndex: number) => {
    const newFields = [...formFields];
    const [removed] = newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, removed);
    setFormFields(newFields);
  };

  const handleSaveDraft = () => {
    toast.success('Form saved as draft');
  };

  const handlePublish = () => {
    if (!formName || !formType) {
      toast.error('Please complete required fields');
      return;
    }
    if (formFields.length === 0) {
      toast.error('Please add at least one field');
      return;
    }
    toast.success('Form published successfully');
    navigate('/forms');
  };

  const handleBack = () => {
    navigate('/forms');
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-50">
        {/* STICKY HEADER */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="px-8 py-4">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-3">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={handleBack} className="cursor-pointer">
                    Forms & Workflows
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={handleBack} className="cursor-pointer">
                    Forms
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Create New Form</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Title & Actions */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-2xl font-bold text-slate-900">Create New Form</h1>
                </div>
                <p className="text-sm text-slate-600 ml-12">
                  Create reusable, workflow-enabled data collection forms
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handleBack}>
                  Discard
                </Button>
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button onClick={handlePublish}>
                  Publish Form
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="max-w-[1600px] mx-auto px-8 py-8 space-y-6">
          
          {/* SECTION 1: FORM METADATA CARD */}
          <Card>
            <CardHeader>
              <CardTitle>Form Metadata</CardTitle>
              <CardDescription>
                Define basic information about your form
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Form Name */}
                <div className="space-y-2">
                  <Label htmlFor="form-name">
                    Form Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="form-name"
                    placeholder="e.g., Annual Conference Registration"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                {/* Form Type */}
                <div className="space-y-2">
                  <Label htmlFor="form-type">
                    Form Type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger id="form-type">
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standalone">Standalone Form</SelectItem>
                      <SelectItem value="event-registration">Event Registration Form</SelectItem>
                      <SelectItem value="application">Application Form</SelectItem>
                      <SelectItem value="award">Award / Nomination Form</SelectItem>
                      <SelectItem value="survey">Survey / Research Form</SelectItem>
                      <SelectItem value="internal">Internal Workflow Form</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Form Type defines available fields, workflows, and assignment logic.
                  </p>
                </div>

                {/* Form Description */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="form-description">Form Description</Label>
                  <Textarea
                    id="form-description"
                    placeholder="Describe the purpose and usage of this form..."
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 2: FIELD BUILDER CARD (3-PANEL INTERFACE) */}
          <Card>
            <CardHeader>
              <CardTitle>Field Builder</CardTitle>
              <CardDescription>
                Build your form by adding and configuring fields
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 divide-x divide-slate-200">
                
                {/* LEFT PANEL: Field Library */}
                <div className="col-span-3 p-6 bg-slate-50/50 max-h-[600px] overflow-y-auto">
                  <h3 className="font-semibold text-sm text-slate-900 mb-4">Field Library</h3>
                  
                  {/* Basic Fields */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                      Basic Fields
                    </h4>
                    <div className="space-y-1">
                      {fieldLibrary.basic.map((field) => (
                        <button
                          key={field.type}
                          onClick={() => handleAddField(field.type, field.label)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
                        >
                          <field.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                          <span>{field.label}</span>
                          <Plus className="h-3 w-3 ml-auto text-slate-300 group-hover:text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Fields */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                      Advanced Fields
                    </h4>
                    <div className="space-y-1">
                      {fieldLibrary.advanced.map((field) => (
                        <button
                          key={field.type}
                          onClick={() => handleAddField(field.type, field.label)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
                        >
                          <field.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                          <span>{field.label}</span>
                          <Plus className="h-3 w-3 ml-auto text-slate-300 group-hover:text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Identity Fields */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                      Identity Fields
                    </h4>
                    <div className="space-y-1">
                      {fieldLibrary.identity.map((field) => (
                        <button
                          key={field.type}
                          onClick={() => handleAddField(field.type, field.label)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
                        >
                          <field.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                          <span>{field.label}</span>
                          <Plus className="h-3 w-3 ml-auto text-slate-300 group-hover:text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* System & Logic Fields */}
                  <div className="mb-6">
                    <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                      System & Logic Fields
                    </h4>
                    <div className="space-y-1">
                      {fieldLibrary.system.map((field) => (
                        <button
                          key={field.type}
                          onClick={() => handleAddField(field.type, field.label)}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
                        >
                          <field.icon className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
                          <span>{field.label}</span>
                          <Plus className="h-3 w-3 ml-auto text-slate-300 group-hover:text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CENTER PANEL: Form Canvas */}
                <div className="col-span-5 p-6 max-h-[600px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-slate-900">Form Canvas</h3>
                    <Badge variant="outline" className="text-xs">
                      {formFields.length} field{formFields.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {formFields.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-1">No fields added yet</p>
                      <p className="text-xs text-slate-400">
                        Drag fields from the library or click to add
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formFields.map((field, index) => (
                        <DraggableField
                          key={field.id}
                          field={field}
                          index={index}
                          isSelected={selectedField?.id === field.id}
                          onSelect={() => setSelectedField(field)}
                          onRemove={() => handleRemoveField(field.id)}
                          onDuplicate={() => handleDuplicateField(field)}
                          moveField={moveField}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT PANEL: Field Configuration */}
                <div className="col-span-4 p-6 bg-slate-50/50 max-h-[600px] overflow-y-auto">
                  {selectedField ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-sm text-slate-900 mb-1">
                          Field Configuration
                        </h3>
                        <p className="text-xs text-slate-500">
                          Configure selected field properties
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        {/* Field Label */}
                        <div className="space-y-2">
                          <Label htmlFor="field-label">Field Label</Label>
                          <Input
                            id="field-label"
                            value={selectedField.label}
                            onChange={(e) => {
                              const updated = { ...selectedField, label: e.target.value };
                              setSelectedField(updated);
                              setFormFields(formFields.map(f => f.id === updated.id ? updated : f));
                            }}
                          />
                        </div>

                        {/* Placeholder Text */}
                        <div className="space-y-2">
                          <Label htmlFor="field-placeholder">Placeholder Text</Label>
                          <Input
                            id="field-placeholder"
                            placeholder="Enter placeholder..."
                            value={selectedField.placeholder || ''}
                            onChange={(e) => {
                              const updated = { ...selectedField, placeholder: e.target.value };
                              setSelectedField(updated);
                              setFormFields(formFields.map(f => f.id === updated.id ? updated : f));
                            }}
                          />
                        </div>

                        {/* Required Field Toggle */}
                        <div className="flex items-center justify-between">
                          <Label htmlFor="field-required">Required Field</Label>
                          <Switch
                            id="field-required"
                            checked={selectedField.required}
                            onCheckedChange={(checked) => {
                              const updated = { ...selectedField, required: checked };
                              setSelectedField(updated);
                              setFormFields(formFields.map(f => f.id === updated.id ? updated : f));
                            }}
                          />
                        </div>

                        {/* PII Data Toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="field-pii">PII Data</Label>
                            <p className="text-xs text-slate-500">Mark as personally identifiable</p>
                          </div>
                          <Switch
                            id="field-pii"
                            checked={selectedField.isPII || false}
                            onCheckedChange={(checked) => {
                              const updated = { ...selectedField, isPII: checked };
                              setSelectedField(updated);
                              setFormFields(formFields.map(f => f.id === updated.id ? updated : f));
                            }}
                          />
                        </div>

                        <Separator />

                        {/* Editable By */}
                        <div className="space-y-2">
                          <Label>Editable By</Label>
                          <div className="space-y-2">
                            {['Admin', 'Reviewer', 'Applicant'].map((role) => (
                              <label key={role} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  className="rounded border-slate-300"
                                  defaultChecked={role === 'Admin' || role === 'Applicant'}
                                />
                                <span>{role}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Validation Rules */}
                        <div className="space-y-2">
                          <Label>Validation Rules</Label>
                          <Button variant="outline" size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Validation Rule
                          </Button>
                        </div>

                        {/* Visibility Conditions */}
                        <div className="space-y-2">
                          <Label>Visibility Conditions</Label>
                          <Button variant="outline" size="sm" className="w-full">
                            <GitBranch className="h-4 w-4 mr-2" />
                            Add Condition
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <Settings className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500 mb-1">No field selected</p>
                      <p className="text-xs text-slate-400">
                        Select a field to configure its properties
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* SECTION 3: ASSIGNMENT RULES CARD */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment Rules</CardTitle>
              <CardDescription>
                Configure how form submissions are assigned to reviewers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentRulesBuilder
                value={assignmentType}
                onChange={setAssignmentType}
              />
            </CardContent>
          </Card>

          {/* SECTION 4: WORKFLOWS & AUTOMATION CARD */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workflows & Automation</CardTitle>
                  <CardDescription>
                    Enable multi-stage workflows with approval chains
                  </CardDescription>
                </div>
                <Switch
                  checked={workflowEnabled}
                  onCheckedChange={setWorkflowEnabled}
                />
              </div>
            </CardHeader>
            {workflowEnabled && (
              <CardContent className="space-y-6">
                <Tabs defaultValue="stages" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="stages">Workflow Stages</TabsTrigger>
                    <TabsTrigger value="approvals">Approval Rules</TabsTrigger>
                    <TabsTrigger value="triggers">Trigger Actions</TabsTrigger>
                  </TabsList>

                  {/* TAB 1: WORKFLOW STAGES */}
                  <TabsContent value="stages" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      {workflowStages.map((stage, index) => (
                        <div key={stage.id} className="border border-slate-200 rounded-lg p-4 bg-white">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{stage.name}</h4>
                              <p className="text-xs text-slate-500">
                                Assigned to: {stage.roles.join(', ')}
                              </p>
                            </div>
                            {stage.approvalRequired && (
                              <Badge variant="secondary">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approval Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workflow Stage
                    </Button>
                  </TabsContent>

                  {/* TAB 2: APPROVAL RULES */}
                  <TabsContent value="approvals" className="space-y-4 mt-4">
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <h4 className="font-medium text-sm mb-3">Approval Configuration</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Require sequential approvals</Label>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Allow parallel approvals</Label>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Auto-approve after all reviews</Label>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: TRIGGER ACTIONS */}
                  <TabsContent value="triggers" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Send Email */}
                      <button className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                        <Mail className="h-5 w-5 text-blue-600 mb-2" />
                        <h4 className="font-medium text-sm mb-1">Send Email</h4>
                        <p className="text-xs text-slate-500">Trigger email notifications</p>
                      </button>

                      {/* Send Notification */}
                      <button className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                        <Bell className="h-5 w-5 text-amber-600 mb-2" />
                        <h4 className="font-medium text-sm mb-1">Send Notification</h4>
                        <p className="text-xs text-slate-500">In-app notifications</p>
                      </button>

                      {/* Webhook */}
                      <button className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                        <Webhook className="h-5 w-5 text-purple-600 mb-2" />
                        <h4 className="font-medium text-sm mb-1">Webhook</h4>
                        <p className="text-xs text-slate-500">Call external API</p>
                      </button>

                      {/* Update Records */}
                      <button className="border border-slate-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left">
                        <Database className="h-5 w-5 text-green-600 mb-2" />
                        <h4 className="font-medium text-sm mb-1">Update Records</h4>
                        <p className="text-xs text-slate-500">Modify related data</p>
                      </button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>

          {/* SECTION 5: REVIEW & PREVIEW CARD */}
          <Card>
            <CardHeader>
              <CardTitle>Review & Preview</CardTitle>
              <CardDescription>
                Validate your form configuration before publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Validation Summary */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Publish Readiness Checklist</h4>
                <div className="space-y-2">
                  {/* Checklist Items */}
                  <div className="flex items-center gap-3">
                    {formName && formType ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="text-sm text-slate-700">Form metadata completed</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {formFields.length > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    )}
                    <span className="text-sm text-slate-700">At least one field added</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-slate-700">Assignment rules configured</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {workflowEnabled ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-slate-300" />
                    )}
                    <span className="text-sm text-slate-700">Workflow configured (optional)</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Preview Button */}
              <Button variant="outline" size="lg" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Preview Form
              </Button>

              {/* Warning */}
              {formFields.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-amber-900 mb-1">
                      No fields configured
                    </h4>
                    <p className="text-xs text-amber-700">
                      Add at least one field before publishing your form.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </DndProvider>
  );
}
