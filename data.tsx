// import React, { useState, useRef } from 'react';
// import Webcam from 'react-webcam';
// import { MdOutlineCamera } from 'react-icons/md';
// import { motion } from 'framer-motion';

// const ResponsiveCaptureComponent = () => {
//   const [isCaptureEnable, setCaptureEnable] = useState(false);
//   const [isImageCaptured, setIsImageCaptured] = useState(false);
//   const [isAttested, setIsAttested] = useState(false);
//   const webcamRef = useRef(null);
//   const urlRef = useRef(null);
//   const timestampRef = useRef(null);

//   const videoConstraints = {
//     width: { ideal: 1280 },
//     height: { ideal: 720 },
//     facingMode: 'user'
//   };

//   const handleDelete = () => {
//     urlRef.current = null;
//     setIsImageCaptured(false);
//     setIsAttested(false);
//   };

//   const handleUpload = () => {
//     // Placeholder for attestation logic
//     setIsAttested(true);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-6xl mx-auto"
//       >
//         {/* Capture/End Button */}
//         <div className="flex justify-center mb-8">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             className="bg-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
//             onClick={() => setCaptureEnable(!isCaptureEnable)}
//           >
//             {!isCaptureEnable ? 'Start' : 'End'}
//           </motion.button>
//         </div>

//         {/* Timestamp Display */}
//         {timestampRef.current && (
//           <div className="text-center mb-4">
//             <p className="text-gray-600">
//               Timestamp: {new Date(timestampRef.current).toLocaleString()}
//             </p>
//           </div>
//         )}

//         {/* Camera and Image Container */}
//         <div className="flex flex-col md:flex-row justify-center items-center gap-8">
//           {/* Camera UI */}
//           {isCaptureEnable && (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="w-full max-w-md"
//             >
//               <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//                 videoConstraints={videoConstraints}
//                 className="w-full rounded-xl shadow-lg"
//               />
//               <div className="flex justify-center mt-4">
//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={capture}
//                   className="bg-green-500 text-white p-4 rounded-full shadow-md hover:bg-green-600 transition-colors"
//                 >
//                   <MdOutlineCamera size={24} />
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}

//           {/* Captured Image UI */}
//           {isImageCaptured && urlRef.current && (
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="w-full max-w-md"
//             >
//               <img
//                 src={urlRef.current}
//                 alt="Screenshot"
//                 className="w-full rounded-xl shadow-lg"
//               />
//             </motion.div>
//           )}
//         </div>

//         {/* Action Buttons */}
//         {isImageCaptured && urlRef.current && (
//           <div className="flex justify-center space-x-4 mt-8">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={handleDelete}
//               className="bg-red-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
//             >
//               Delete
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => {/* navigation logic */}}
//               disabled={!isAttested}
//               className={`px-6 py-2 rounded-full shadow-md transition-colors ${
//                 isAttested 
//                   ? 'bg-blue-500 text-white hover:bg-blue-600' 
//                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               }`}
//             >
//               Edit
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={handleUpload}
//               className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600 transition-colors"
//             >
//               Attest
//             </motion.button>
//           </div>
//         )}

//         {/* Walkthrough Instructions */}
//         <motion.div 
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="mt-12 bg-white p-6 rounded-xl shadow-md"
//         >
//           <h2 className="text-2xl font-bold mb-4 text-center">Capture & Attest Walkthrough</h2>
//           <div className="grid md:grid-cols-2 gap-4 text-gray-700">
//             <div>
//               <p><strong>Start:</strong> Activate the in-built camera</p>
//               <p><strong>End:</strong> Deactivate the camera</p>
//               <p><strong>Capture:</strong> Take a photo</p>
//             </div>
//             <div>
//               <p><strong>Retake:</strong> Shoot the image again</p>
//               <p><strong>Edit:</strong> Modify the captured image</p>
//               <p><strong>Attest:</strong> Verify digital image provenance</p>
//             </div>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// };

// export default ResponsiveCaptureComponent;