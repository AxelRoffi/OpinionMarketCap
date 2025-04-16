// app/components/OpinionDetail.tsx
import React from 'react';

interface OpinionDetailProps {
  question: string;
  opinion: string;
  owner: string;
  currentPrice: string;
  nextPrice: string;
  volume: string;
  creatorEarnings: string;
  ownerEarnings: string;
}

export default function OpinionDetail({
  question,
  opinion,
  owner,
  currentPrice,
  nextPrice,
  volume,
  creatorEarnings,
  ownerEarnings
}: OpinionDetailProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Question Section */}
        <div className="w-full md:w-1/3">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-lg shadow-lg p-0.5">
            <div className="bg-white rounded-md px-6 py-4 text-center">
              <h1 
                className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-wide uppercase"
                style={{ fontFamily: "var(--font-gaming)" }}
              >
                {question}
              </h1>
            </div>
          </div>
        </div>

        {/* Opinion Section */}
        <div className="w-full md:w-2/3">
          <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 rounded-lg shadow-lg p-0.5">
            <div className="bg-white rounded-md p-6 flex flex-col h-full">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-blue-700 rounded-full mr-2"></div>
                <span className="text-xs font-medium text-gray-500 uppercase">Opinion</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div 
                    className="px-4 py-2 rounded-lg bg-blue-100 mr-4 bg-opacity-70"
                  >
                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-900 uppercase">
                      {opinion}
                    </span>
                  </div>
                  
                  <button 
                    className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 rounded-lg p-0.5"
                  >
                    <div className="bg-white rounded-md px-4 py-2 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-900 hover:from-blue-900 hover:to-indigo-950 transition-all duration-300">
                      Change Opinion for {nextPrice} USDC
                    </div>
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Price Paid</div>
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-900">
                      {currentPrice} USDC
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Owned By</div>
                    <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 rounded-lg shadow-md p-0.5">
                      <div className="bg-white rounded-md px-3 py-2 flex items-center">
                        <div className="mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          {owner}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}