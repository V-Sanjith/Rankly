import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth.service';

export function Settings() {
  const { user, setAuth } = useAuthStore();
  const { success, error } = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await authService.updateProfile({ name: profileData.name });
      if (res.success && res.data) {
        setAuth(res.data, localStorage.getItem('rankly-auth') ? JSON.parse(localStorage.getItem('rankly-auth')!).state.token : '');
        success('Profile updated successfully');
      } else {
        error('Failed to update profile');
      }
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await authService.changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      if (res.success) {
        success('Password changed successfully');
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        error('Failed to change password');
      }
    } catch (err: any) {
      error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-muted mt-1">Manage your account preferences and settings.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-text mb-6">Profile Settings</h2>
        <form onSubmit={handleProfileSave} className="space-y-6 max-w-lg">
          <Input
            label="Full Name"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={profileData.email}
            disabled
            readOnly
          />
          <p className="text-xs text-text-muted -mt-4">
            Email address cannot be changed. Contact support if you need to update it.
          </p>
          <Button type="submit" variant="primary" isLoading={profileLoading}>
            Save Changes
          </Button>
        </form>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-text mb-6">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
          <Input
            label="Current Password"
            type="password"
            value={passwordData.current}
            onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={passwordData.new}
            onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordData.confirm}
            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
            required
          />
          <Button type="submit" variant="secondary" isLoading={passwordLoading}>
            Change Password
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default Settings;
