export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Loading */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-600 rounded"></div>
              <div className="w-32 h-4 bg-gray-600 rounded"></div>
            </div>
            <div className="flex space-x-3">
              <div className="w-20 h-8 bg-gray-600 rounded"></div>
              <div className="w-20 h-8 bg-gray-600 rounded"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="w-3/4 h-8 bg-gray-600 rounded"></div>
              <div className="w-1/2 h-4 bg-gray-600 rounded"></div>
              <div className="w-full h-32 bg-gray-600 rounded"></div>
              <div className="flex space-x-2">
                <div className="w-16 h-6 bg-gray-600 rounded"></div>
                <div className="w-20 h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="w-full h-32 bg-gray-600 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-16 bg-gray-600 rounded"></div>
                <div className="w-full h-16 bg-gray-600 rounded"></div>
              </div>
              <div className="w-full h-12 bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>

        {/* Stats Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-600 rounded"></div>
                <div className="w-12 h-4 bg-gray-600 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-8 bg-gray-600 rounded"></div>
                <div className="w-16 h-4 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Loading */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-gray-600 rounded"></div>
            <div className="flex space-x-2">
              <div className="w-20 h-8 bg-gray-600 rounded"></div>
              <div className="w-24 h-8 bg-gray-600 rounded"></div>
            </div>
          </div>
          <div className="w-full h-80 bg-gray-600 rounded"></div>
        </div>

        {/* Activity Loading */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-gray-600 rounded"></div>
            <div className="flex space-x-2">
              <div className="w-16 h-8 bg-gray-600 rounded"></div>
              <div className="w-20 h-8 bg-gray-600 rounded"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-600 rounded"></div>
                    <div className="w-24 h-3 bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}