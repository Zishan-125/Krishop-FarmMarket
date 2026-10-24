import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-5 px-[5%]">
      <div className="flex flex-wrap justify-between">
        <div className="w-full md:w-1/3 p-4 text-center">
          <h3 className="text-lg mb-2 border-b-2 border-orange-500 inline-block pb-1">গ্রাহক সাপোর্ট</h3>
          <p><a href="#" className="text-white no-underline hover:underline hover:text-orange-500">যোগাযোগ করুন</a></p>
          <p><a href="#" className="text-white no-underline hover:underline hover:text-orange-500">শিপিং এবং ডেলিভারি নীতি</a></p>
          <p><a href="#" className="text-white no-underline hover:underline hover:text-orange-500">রিফান্ড এবং রিটার্ন নীতি</a></p>
          <p><a href="#" className="text-white no-underline hover:underline hover:text-orange-500">শর্তাবলী</a></p>
        </div>
        
        <div className="w-full md:w-1/3 p-4 text-center">
          <h3 className="text-lg mb-2 border-b-2 border-orange-500 inline-block pb-1">যোগাযোগ</h3>
          <p>হটলাইন: <br />01885222985</p>
          <p>ইমেইল</p>
          <a href="mailto:support@krishop.com.bd" className="text-orange-500 font-bold no-underline hover:text-white">
            support@krishop.com.bd
          </a>
        </div>
        
        <div className="w-full md:w-1/3 p-4 text-center">
          <h3 className="text-lg mb-2 border-b-2 border-orange-500 inline-block pb-1">আমার একাউন্ট</h3>
          <p><a href="#" className="text-white no-underline hover:underline hover:text-orange-500">লগইন</a></p>
          <p><a href="#" className="text-white no-underline hover:underline hover:text-orange-500">সাইন আপ</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;