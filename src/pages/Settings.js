import React from 'react';
import NotificationSettings from '../components/NotificationSettings';

const Settings = () => {
  return (
    <div className="min-h-screen bg-beige-50 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-playfair text-center mb-12 text-black">الإعدادات</h1>
        
        <NotificationSettings />
        
        {/* Can add more settings sections here */}
      </div>
    </div>
  );
};

export default Settings;
