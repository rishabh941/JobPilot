import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure your application preferences
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon size={20} />
            Coming Soon
          </CardTitle>
          <CardDescription>
            Settings and configuration options will be available here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              This section is under development. Future features will include:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>• API Configuration</li>
              <li>• Notification Preferences</li>
              <li>• Auto-apply Settings</li>
              <li>• Theme Customization</li>
              <li>• Export/Import Data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}