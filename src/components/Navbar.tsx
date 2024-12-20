import { SignOutButton } from './SignOutButton';

export function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">
                Don't Double Book Me
              </h1>
            </div>
          </div>
          <div className="flex items-center">
            <SignOutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}