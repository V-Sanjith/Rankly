import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Card } from '../../components/ui/Card';
import { ProjectForm, type ProjectFormData } from '../../components/project/ProjectForm';
import { useToast } from '../../components/ui/Toast';
import { projectService } from '../../services/project.service';

export function SubmitProject() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialUrl = searchParams.get('url') || '';
  const initialCategory = searchParams.get('category') || '';

  const handleSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      const res = await projectService.create({
        name: data.name,
        url: data.url,
        shortDescription: data.shortDescription,
        description: data.description,
        category: data.category.toUpperCase().replace(/\s+/g, '_'),
        imageUrl: data.imageUrl || undefined,
        founderName: data.founderName || undefined,
        contactEmail: data.contactEmail || undefined,
        socialLinks: (data.twitterUrl || data.githubUrl) ? {
          ...(data.twitterUrl ? { twitter: data.twitterUrl } : {}),
          ...(data.githubUrl ? { github: data.githubUrl } : {}),
        } : undefined,
      });

      if (res.success) {
        success('Project submitted successfully for review!');
        navigate('/dashboard/projects');
      } else {
        error('Failed to submit project');
      }
    } catch (err: any) {
      error(err.message || 'Failed to submit project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Submit Project</h1>
        <p className="text-text-muted mt-1">
          Share your project with the community. Fill in the details below.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <ProjectForm
          initialData={{
            url: initialUrl,
            category: initialCategory,
          }}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Card>
    </div>
  );
}

export default SubmitProject;
