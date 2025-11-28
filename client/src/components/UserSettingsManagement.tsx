import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSettingsManagementProps {
  onBack: () => void;
}

export default function UserSettingsManagement({ onBack }: UserSettingsManagementProps) {
  const [searchUsername, setSearchUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchUsername.trim()) return;
    setIsLoading(true);
    try {
      const userRes = await fetch(`/api/users/username/${searchUsername}`);
      if (!userRes.ok) throw new Error("User not found");
      const user = await userRes.json();
      setSelectedUser(user);
      const settingsRes = await fetch(`/api/settings/${user.id}`);
      const settings = await settingsRes.json();
      setUserSettings(settings);
    } catch (e) {
      alert("User not found");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    if (!selectedUser) return;
    try {
      const updated = { ...userSettings, [key]: value };
      const res = await fetch(`/api/settings/${selectedUser.id}`, {
        method: 'POST',
        body: JSON.stringify(updated),
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      setUserSettings(result);
    } catch (e) {
      console.error("Failed to update setting:", e);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-3xl font-bold">User Settings Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Enter username..." value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} />
              <Button onClick={handleSearch} disabled={isLoading}><Search className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        {selectedUser && userSettings && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User: {selectedUser.displayName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold">Private Account</label>
                    <input type="checkbox" checked={userSettings.privateAccount} onChange={(e) => updateSetting('privateAccount', e.target.checked)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Allow Comments</label>
                    <input type="checkbox" checked={userSettings.allowComments} onChange={(e) => updateSetting('allowComments', e.target.checked)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Allow Mentions</label>
                    <input type="checkbox" checked={userSettings.allowMentions} onChange={(e) => updateSetting('allowMentions', e.target.checked)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Hide Explicit</label>
                    <input type="checkbox" checked={userSettings.contentHideExplicit} onChange={(e) => updateSetting('contentHideExplicit', e.target.checked)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Notifications - Likes</label>
                    <input type="checkbox" checked={userSettings.notificationsLikes} onChange={(e) => updateSetting('notificationsLikes', e.target.checked)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Notifications - Comments</label>
                    <input type="checkbox" checked={userSettings.notificationsComments} onChange={(e) => updateSetting('notificationsComments', e.target.checked)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Dark Mode</label>
                    <input type="checkbox" checked={userSettings.displayDarkMode} onChange={(e) => updateSetting('displayDarkMode', e.target.checked)} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Text Size</label>
                    <select value={userSettings.displayTextSize} onChange={(e) => updateSetting('displayTextSize', e.target.value)} className="w-full p-2 border rounded">
                      <option value="normal">Normal</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
