import React from 'react';

// A simple back arrow icon
const ArrowLeftIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
);

const TestLogin = ({ onBack }) => {
    return (
        <div className="mx-auto max-w-2xl">
            <div className="relative rounded-xl border bg-white p-6 shadow-sm sm:p-8">
                {/* Back Button */}
                <button 
                    onClick={onBack} 
                    className="absolute top-4 left-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-cyan-700"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Dashboard
                </button>

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">Candidate Login</h2>
                    <p className="mt-2 text-sm text-gray-500">Enter your assessment details to begin</p>
                </div>

                <form className="mt-8 space-y-5">
                    {/* Input Field: Assessment ID */}
                    <div>
                        <label htmlFor="assessmentId" className="mb-1 block text-sm font-medium text-gray-700">
                            Assessment ID
                        </label>
                        <input
                            type="text"
                            id="assessmentId"
                            placeholder="e.g. FE-DEV-2023-001"
                            className="w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Input Field: Full Name */}
                    <div>
                        <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            placeholder="John Doe"
                            className="w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Input Field: Email Address */}
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                            Email address
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            className="w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        />
                    </div>

                    {/* Input Field: Phone Number */}
                    <div>
                        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            placeholder="+1 (555) 123-4567"
                            className="w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                        />
                    </div>
                    
                    {/* Input Field: Years of Experience */}
                    <div>
                        <label htmlFor="experience" className="mb-1 block text-sm font-medium text-gray-700">
                           Years of Experience
                        </label>
                        <select id="experience" className="w-full rounded-md border-gray-300 px-4 py-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500">
                            <option>Select experience</option>
                            <option>0-1 years</option>
                            <option>1-3 years</option>
                            <option>3-5 years</option>
                            <option>5+ years</option>
                        </select>
                    </div>

                    {/* Checkbox */}
                    <div className="flex items-center gap-3 pt-2">
                        <input
                            id="terms"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                            I agree to the assessment terms and conditions
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gradient-to-r from-cyan-600 to-pink-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        >
                            Start Assessment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TestLogin;