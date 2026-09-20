import React, { useState } from 'react';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50),
  url: z.string().url('Must be a valid URL'),
  shortDescription: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  founderName: z.string().min(2, 'Founder name required'),
  contactEmail: z.string().email('Valid email required'),
  twitterUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    name: initialData?.name || '',
    url: initialData?.url || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    imageUrl: initialData?.imageUrl || '',
    founderName: initialData?.founderName || '',
    contactEmail: initialData?.contactEmail || '',
    twitterUrl: initialData?.twitterUrl || '',
    githubUrl: initialData?.githubUrl || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof ProjectFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validData = projectSchema.parse(formData);
      setErrors({});
      await onSubmit(validData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err: any) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const shortDesc = formData.shortDescription || '';
  const desc = formData.description || '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Project Name"
          name="name"
          placeholder="e.g. Rankly"
          value={formData.name || ''}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="Project URL"
          name="url"
          placeholder="https://example.com"
          value={formData.url || ''}
          onChange={handleChange}
          error={errors.url}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">Short Description</label>
        <textarea
          name="shortDescription"
          className="w-full bg-elevated border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          rows={2}
          value={formData.shortDescription || ''}
          onChange={handleChange}
          placeholder="A catchy one-liner about your project"
        />
        <div className="flex justify-between text-xs">
          <span className="text-error">{errors.shortDescription}</span>
          <span className={shortDesc.length > 200 ? 'text-error' : 'text-text-muted'}>
            {shortDesc.length}/200
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-text">Detailed Description</label>
        <textarea
          name="description"
          className="w-full bg-elevated border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          rows={6}
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Explain what your project does, who it's for, and why it's great..."
        />
        <div className="flex justify-between text-xs">
          <span className="text-error">{errors.description}</span>
          <span className={desc.length > 5000 ? 'text-error' : 'text-text-muted'}>
            {desc.length}/5000
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text">Category</label>
          <select
            name="category"
            className="w-full bg-elevated border border-border rounded-lg px-4 py-2 h-[42px] text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={formData.category || ''}
            onChange={handleChange}
          >
            <option value="">Select a category</option>
            <option value="SaaS">SaaS</option>
            <option value="AI">AI</option>
            <option value="Developer Tools">Developer Tools</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && (
            <span className="text-xs text-error">{errors.category}</span>
          )}
        </div>
        <Input
          label="Image URL (Optional)"
          name="imageUrl"
          placeholder="https://example.com/image.png"
          value={formData.imageUrl || ''}
          onChange={handleChange}
          error={errors.imageUrl}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
        <Input
          label="Founder Name"
          name="founderName"
          value={formData.founderName || ''}
          onChange={handleChange}
          error={errors.founderName}
        />
        <Input
          label="Contact Email"
          name="contactEmail"
          type="email"
          value={formData.contactEmail || ''}
          onChange={handleChange}
          error={errors.contactEmail}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
        <Input
          label="Twitter URL (Optional)"
          name="twitterUrl"
          placeholder="https://twitter.com/..."
          value={formData.twitterUrl || ''}
          onChange={handleChange}
          error={errors.twitterUrl}
        />
        <Input
          label="GitHub URL (Optional)"
          name="githubUrl"
          placeholder="https://github.com/..."
          value={formData.githubUrl || ''}
          onChange={handleChange}
          error={errors.githubUrl}
        />
      </div>

      <div className="pt-6">
        <Button type="submit" variant="primary" className="w-full md:w-auto" isLoading={isLoading}>
          Submit Project
        </Button>
      </div>
    </form>
  );
}
