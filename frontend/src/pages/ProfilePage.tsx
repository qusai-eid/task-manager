import UserProfile from '../components/profile/UserProfile';

export default function ProfilePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account details and preferences</p>
      </div>
      <UserProfile />
    </div>
  );
}
