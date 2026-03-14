import React from 'react';
import AdminSettingsForm from '../components/AdminSettingsForm';

const AdminSettingsPage = () => {
  const handleSettingsSaved = () => {
    // Optionally trigger a re-fetch of data in parent components that use these settings
    // Or just provide a success message.
    console.log('App settings saved successfully!');
  };

  return (
    <div className="py-8 md:py-12 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text mb-8 md:mb-10 animate-fade-in-up">Manage App Settings</h1>

      <section className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary mb-8 md:mb-12 animate-fade-in-up animation-delay-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 md:mb-8">Global Configuration</h2>
        <p className="text-secondary text-base mb-6">
          Adjust global settings such as founder/instructor images or other site-wide content.
        </p>
        <AdminSettingsForm onSettingsSaved={handleSettingsSaved} />
      </section>
    </div>
  );
};

export default AdminSettingsPage;