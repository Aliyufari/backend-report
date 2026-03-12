import { Loader } from 'lucide-react';

export default function GlobalLoader() {
  return (
    <div className="w-full h-screen bg-white text-green-600 fixed top-0 left-0 flex justify-center items-center p-6 z-50">
      <span className="w-30 min-w-30 h-30 flex justify-center items-center rounded-full animate-spin"> <Loader size={60} /> </span> 
    </div>
  );
}
