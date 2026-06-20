import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const RequestsRecommendedPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);

  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqPerfumeName, setReqPerfumeName] = useState('');
  const [reqImage, setReqImage] = useState(null);
  const [reqImageBase64, setReqImageBase64] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  const [recPerfumeName, setRecPerfumeName] = useState('');
  const [recImage, setRecImage] = useState(null);
  const [recImageBase64, setRecImageBase64] = useState('');
  const [recLoading, setRecLoading] = useState(false);

  const toBase64 = (file, setter) => {
    const reader = new FileReader();
    reader.onloadend = () => setter(reader.result);
    reader.readAsDataURL(file);
  };

  const closeSheet = () => setActiveTab(null);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!reqName || !reqPhone || !reqPerfumeName) {
      Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please fill all required fields', confirmButtonColor: '#000' });
      return;
    }
    setReqLoading(true);
    try {
      await axios.post('/api/products/requests-recommended', {
        type: 'request', name: reqName, phone: reqPhone,
        perfumeName: reqPerfumeName, imageBase64: reqImageBase64, category,
      });
      Swal.fire({ icon: 'success', title: 'Request Sent!', text: 'We will get back to you soon.', timer: 2000, showConfirmButton: false });
      setReqName(''); setReqPhone(''); setReqPerfumeName(''); setReqImage(null); setReqImageBase64('');
      closeSheet();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to send. Please try again.', confirmButtonColor: '#000' });
    } finally {
      setReqLoading(false);
    }
  };

  const handleSendRecommendation = async (e) => {
    e.preventDefault();
    if (!recPerfumeName) {
      Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please enter the perfume name', confirmButtonColor: '#000' });
      return;
    }
    setRecLoading(true);
    try {
      await axios.post('/api/products/requests-recommended', {
        type: 'recommended', perfumeName: recPerfumeName,
        imageBase64: recImageBase64, category,
      });
      Swal.fire({ icon: 'success', title: 'Recommendation Sent!', text: 'Thanks for your suggestion!', timer: 2000, showConfirmButton: false });
      setRecPerfumeName(''); setRecImage(null); setRecImageBase64('');
      closeSheet();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to send. Please try again.', confirmButtonColor: '#000' });
    } finally {
      setRecLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl font-montserrat text-sm focus:outline-none focus:border-black transition-colors bg-gray-50";

  return (
    <div className="min-h-screen bg-beige-50 py-24 pb-32">
      <div className="max-w-2xl mx-auto px-6">

        {/* Back */}
        <button
          onClick={() => navigate(`/category/${category}`)}
          className="inline-flex items-center gap-2 text-sm font-montserrat text-gray-500 hover:text-black transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        <h1 className="font-playfair text-2xl sm:text-3xl text-black text-center mb-1">Requests & Recommended</h1>
        <p className="font-montserrat text-xs sm:text-sm text-gray-400 text-center mb-6">Choose an option below</p>

        {/* Two Cards */}
        <div className="flex flex-col gap-3">
          {/* Requests Card */}
          <button
            onClick={() => setActiveTab('requests')}
            className="group w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-black hover:shadow-md transition-all duration-300 text-left"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 sm:w-5 sm:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-playfair text-base sm:text-lg text-black mb-0.5">Requests</h3>
              <p className="font-montserrat text-xs text-gray-400 leading-tight">Request a perfume we'll source it for you</p>
            </div>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Recommended Card */}
          <button
            onClick={() => setActiveTab('recommended')}
            className="group w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-black hover:shadow-md transition-all duration-300 text-left"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 sm:w-5 sm:h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-playfair text-base sm:text-lg text-black mb-0.5">Recommended</h3>
              <p className="font-montserrat text-xs text-gray-400 leading-tight">Suggest a fragrance we should carry</p>
            </div>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== BOTTOM SHEET OVERLAY ===== */}
      {activeTab && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSheet}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 pt-4 pb-8">
              {/* Sheet Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                    {activeTab === 'requests' ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </div>
                  <h2 className="font-playfair text-xl text-black">
                    {activeTab === 'requests' ? 'Requests' : 'Recommended'}
                  </h2>
                </div>
                <button
                  onClick={closeSheet}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Requests Form */}
              {activeTab === 'requests' && (
                <form onSubmit={handleSendRequest} className="space-y-4">
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                    <input type="text" value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Enter your name" className={inputClass} required />
                  </div>
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <input type="tel" value={reqPhone} onChange={(e) => setReqPhone(e.target.value)} placeholder="Enter your phone number" className={inputClass} required />
                  </div>
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1.5">Perfume Name</label>
                    <input type="text" value={reqPerfumeName} onChange={(e) => setReqPerfumeName(e.target.value)} placeholder="Enter the perfume name" className={inputClass} required />
                  </div>
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1.5">
                      Perfume Image <span className="font-normal text-gray-400">(Optional)</span>
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setReqImage(f); toBase64(f, setReqImageBase64); } }} className="hidden" id="req-image" />
                    <label htmlFor="req-image" className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl font-montserrat text-sm text-gray-400 cursor-pointer hover:border-black hover:text-black transition-colors">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{reqImage ? reqImage.name : 'Upload perfume image'}</span>
                    </label>
                    {reqImageBase64 && <img src={reqImageBase64} alt="preview" className="mt-3 h-20 w-20 object-cover rounded-xl border border-gray-100" />}
                  </div>
                  <button type="submit" disabled={reqLoading} className="w-full bg-black text-white py-3.5 rounded-xl font-montserrat text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {reqLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </form>
              )}

              {/* Recommended Form */}
              {activeTab === 'recommended' && (
                <form onSubmit={handleSendRecommendation} className="space-y-4">
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1.5">Perfume Name</label>
                    <input type="text" value={recPerfumeName} onChange={(e) => setRecPerfumeName(e.target.value)} placeholder="Enter the perfume name" className={inputClass} required />
                  </div>
                  <div>
                    <label className="block font-montserrat text-sm font-medium text-gray-700 mb-1.5">
                      Perfume Image <span className="font-normal text-gray-400">(Optional)</span>
                    </label>
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setRecImage(f); toBase64(f, setRecImageBase64); } }} className="hidden" id="rec-image" />
                    <label htmlFor="rec-image" className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl font-montserrat text-sm text-gray-400 cursor-pointer hover:border-black hover:text-black transition-colors">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{recImage ? recImage.name : 'Upload perfume image'}</span>
                    </label>
                    {recImageBase64 && <img src={recImageBase64} alt="preview" className="mt-3 h-20 w-20 object-cover rounded-xl border border-gray-100" />}
                  </div>
                  <button type="submit" disabled={recLoading} className="w-full bg-black text-white py-3.5 rounded-xl font-montserrat text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {recLoading ? 'Sending...' : 'Send Recommendation'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RequestsRecommendedPage;
