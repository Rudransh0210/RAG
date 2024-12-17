import { useState, useEffect } from 'react';
import { SettingsSection } from '../components/settings/settings-section';
import { ToggleSwitch } from '../components/settings/toggle-switch';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { PasswordSection } from '../components/settings/password-section';
import { updateUserSettings, getUserSettings, type UserSettings } from '../lib/settings';
import { auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    darkMode: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }
        const userSettings = await getUserSettings(user.uid);
        setSettings(userSettings);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      await updateUserSettings(user.uid, settings);
      setSuccess('Settings updated successfully');
    } catch (err: any) {
      setError(err.message);
    }
  };


  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        <SettingsSection
          title="Profile Information"
          description="Update your personal information"
        >
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                type="text"
                value={settings.username}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1"
                disabled
              />
            </div>
          </div>
        </SettingsSection>

        <div className="flex justify-end pt-4">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>

      <div className="mt-8">
        <PasswordSection
          onError={setError}
          onSuccess={() => setSuccess('Password updated successfully')}
        />
      </div>
    </div>
  );
}