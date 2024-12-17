import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { changePassword } from '../../lib/settings';
import { SettingsSection } from './settings-section';

interface PasswordSectionProps {
  onError: (error: string) => void;
  onSuccess: () => void;
}

export function PasswordSection({ onError, onSuccess }: PasswordSectionProps) {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      onError('New passwords do not match');
      return;
    }

    try {
      await changePassword(passwords.current, passwords.new);
      setPasswords({ current: '', new: '', confirm: '' });
      onSuccess();
    } catch (error: any) {
      onError(error.message);
    }
  };

  return (
    <SettingsSection
      title="Change Password"
      description="Update your account password"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Current Password
          </label>
          <Input
            type="password"
            value={passwords.current}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, current: e.target.value }))
            }
            className="mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <Input
            type="password"
            value={passwords.new}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, new: e.target.value }))
            }
            className="mt-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm New Password
          </label>
          <Input
            type="password"
            value={passwords.confirm}
            onChange={(e) =>
              setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
            }
            className="mt-1"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Update Password
        </Button>
      </form>
    </SettingsSection>
  );
}