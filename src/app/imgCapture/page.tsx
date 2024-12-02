/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { RainbowButton } from "@/src/components/ui/rainbow-button";
import { PinataSDK } from "pinata-web3";
import { useRouter } from "next/navigation";
import { Schema, Text, U64 } from "@truenetworkio/sdk";
import { useImageContext } from "../../utils/imageContext";
import { getTrueNetworkInstance } from "@/true-network/true.config";
import { useWalletStore } from "@/src/providers/walletStoreProvider";
import { MdOutlineCamera } from "react-icons/md";
import { motion } from "framer-motion";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: "ivory-tough-leech-456.mypinata.cloud",
});

const videoConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  facingMode: "user",
};

export default function App() {
  const router = useRouter();

  const { connectedAccount, isWalletConnected } = useWalletStore((s) => s);
  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const urlRef = useRef<string | null>(null);
  const timestampRef = useRef<string | null>(null);
  const imageSrcRef = useRef<string | null>(null);
  const [isImageCaptured, setIsImageCaptured] = useState<boolean>(false);
  const [isAttested, setIsAttested] = useState<boolean>(false);
  const ipfsHashRef = useRef<string | null>(null);
  const [ipfsHashLog, setIpfsHashLog] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);
  const { setImageSrc } = useImageContext();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    timestampRef.current = new Date().toISOString();
  }, []);

  const capture = useCallback(() => {
    if (!timestampRef.current) {
      console.log("Timestamp is not available yet.");
      return;
    }
    const capturedImageSrc = webcamRef.current?.getScreenshot();
    if (capturedImageSrc) {
      imageSrcRef.current = capturedImageSrc;
      urlRef.current = capturedImageSrc;
      setImageSrc(capturedImageSrc);
      setIsImageCaptured(true);
    }

    console.log("Captured Image URL:", capturedImageSrc);
    console.log("Timestamp:", timestampRef.current);
    console.log("Image Src", urlRef.current);
  }, [webcamRef, setImageSrc]);

  const handleUpload = async () => {
    if (imageSrcRef.current) {
      localStorage.setItem("capturedImage", imageSrcRef.current);
      const base64Data = imageSrcRef.current.replace(
        /^data:image\/\w+;base64,/,
        ""
      );

      console.log(base64Data);

      try {
        const api = await getTrueNetworkInstance();
        const uploadResult = await pinata.upload.json({ base64Data });
        console.log("Upload successful:", uploadResult);
        console.log(uploadResult.IpfsHash);
        ipfsHashRef.current = uploadResult.IpfsHash;

        setIpfsHashLog(uploadResult.IpfsHash);
        const shareLink = `https://gateway.pinata.cloud/ipfs/${uploadResult.IpfsHash}`;
        setShareableLink(shareLink);

        // Schema for True Network.
        const originalImageSchema = Schema.create({
          cid: Text,
          timestamp: U64,
          parent: U64,
        });

        if (isWalletConnected && connectedAccount?.address) {
          await originalImageSchema.attest(api, connectedAccount?.address, {
            cid: ipfsHashRef.current,
            timestamp: Date.now(),
            parent: 0,
          });
          // setTransactionHash(trueNetworkAttestation);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    console.log("Uploaded", ipfsHashRef);
  };

  const copyShareableLink = () => {
    if (shareableLink) {
      navigator.clipboard
        .writeText(shareableLink)
        .then(() => {
          alert("Shareable link copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
        });
    }
  };

  const shareOnSocialMedia = (
    platform: "twitter" | "linkedin" | "facebook"
  ) => {
    if (!shareableLink) return;

    const text = encodeURIComponent(
      "Check out this image I just uploaded and attested!"
    );
    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(
          shareableLink
        )}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareableLink
        )}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareableLink
        )}`;
        break;
    }

    window.open(shareUrl, "_blank");
  };

  const handleDelete = () => {
    urlRef.current = null;
    imageSrcRef.current = null;
    setIsImageCaptured(false);
    setIsImageCaptured(false);
    setIsAttested(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 pt-36">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Capture/End Button */}
        <div className="flex justify-center ">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-600 transition-colors"
            onClick={() => setCaptureEnable(!isCaptureEnable)}
          >
            {!isCaptureEnable ? "Start" : "End"}
          </motion.button>
        </div>

        {/* Timestamp Display */}
        {timestampRef.current && (
          <div className="text-center mb-4">
            <p className="text-gray-600">
              Timestamp: {new Date(timestampRef.current).toLocaleString()}
            </p>
          </div>
        )}

        {/* Camera and Image Container */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {/* Camera UI */}
          {isCaptureEnable && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md flex flex-row"
            >
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full rounded-xl shadow-lg "
              />
              <div className="flex justify-center mt-4">
                <RainbowButton
                  onClick={capture}
                  className="bg-green-500 text-white p-4 rounded-full shadow-md hover:bg-green-600 transition-colors ml-2"
                >
                  <MdOutlineCamera size={24} />
                </RainbowButton>
              </div>
            </motion.div>
          )}

          {/* Captured Image UI */}
          {isImageCaptured && urlRef.current && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-md"
            >
              <img
                src={urlRef.current}
                alt="Screenshot"
                className="w-full rounded-xl shadow-lg"
              />
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        {isImageCaptured && urlRef.current && (
          <div className="flex justify-center space-x-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="bg-red-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-red-600 transition-colors"
            >
              Delete
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                /* navigation logic */
              }}
              disabled={!isAttested}
              className={`px-6 py-2 rounded-full shadow-md transition-colors ${
                isAttested
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              className="bg-green-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-green-600 transition-colors"
            >
              Attest
            </motion.button>
          </div>
        )}

        {(ipfsHashLog || transactionHash || shareableLink) && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Attestation Details</h3>
            {ipfsHashLog && (
              <div>
                <span className="font-medium">IPFS Hash:</span>{" "}
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${ipfsHashLog}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {ipfsHashLog}
                </a>
              </div>
            )}
            {transactionHash && (
              <div>
                <span className="font-medium">Transaction Hash:</span>{" "}
                {transactionHash}
              </div>
            )}
            {shareableLink && (
              <div className="mt-2 flex justify-center space-x-2">
                <button
                  onClick={copyShareableLink}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Copy Link
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => shareOnSocialMedia("twitter")}
                    className="bg-blue-400 text-white px-3 py-1 rounded hover:bg-blue-500"
                  >
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => shareOnSocialMedia("linkedin")}
                    className="bg-blue-700 text-white px-3 py-1 rounded hover:bg-blue-800"
                  >
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={() => shareOnSocialMedia("facebook")}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Share on Facebook
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Walkthrough Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-12 bg-white p-6 rounded-xl shadow-md"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">
            Capture & Attest Walkthrough
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p>
                <strong>Start:</strong> Activate the in-built camera
              </p>
              <p>
                <strong>End:</strong> Deactivate the camera
              </p>
              <p>
                <strong>Capture:</strong> Take a photo
              </p>
            </div>
            <div>
              <p>
                <strong>Retake:</strong> Shoot the image again
              </p>
              <p>
                <strong>Edit:</strong> Modify the captured image
              </p>
              <p>
                <strong>Attest:</strong> Verify digital image provenance
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
