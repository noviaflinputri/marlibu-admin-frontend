import { Unplug } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="p-4 sm:p-6 md:p-8 w-full min-h-[75vh] flex items-center justify-center font-sans">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Unplug className="w-10 h-10 text-[#0A64BC]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0A64BC]">
          404 Not Found
        </h1>
        <p className="text-xs text-gray-500">
          Halaman tidak ditemukan.
        </p>
      </div>
    </div>
  );
}