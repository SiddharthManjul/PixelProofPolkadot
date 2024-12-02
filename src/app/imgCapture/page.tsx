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

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: "ivory-tough-leech-456.mypinata.cloud",
});

const videoConstraints = {
  width: 720,
  height: 360,
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
    <>
      <div className="flex flex-col items-center mt-24 h-screen">
        {/* Capture/End Button */}
        <div className="absolute top-16 w-full flex justify-center font-grotesk text-lg">
          {!isCaptureEnable ? (
            <RainbowButton onClick={() => setCaptureEnable(true)}>
              Start
            </RainbowButton>
          ) : (
            <RainbowButton onClick={() => setCaptureEnable(false)}>
              End
            </RainbowButton>
          )}
        </div>

        {timestampRef.current && (
          <div className="pt-8 font-grotesk w-full flex flex-col items-center font-bold text-xl">
            <h3>Timestamp:</h3>
            <p>{new Date(timestampRef.current).toLocaleString()}</p>
          </div>
        )}

        {/* Camera and Image Display Side-by-Side */}
        <div className="flex flex-row items-center justify-center gap-8 mt-20">
          {/* Camera UI */}
          {isCaptureEnable && (
            <div className="flex flex-col items-center pt-2">
              <Webcam
                audio={false}
                width={540}
                height={360}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="rounded-xl border-4"
              />
            </div>
          )}
          {isCaptureEnable && (
            <div className="font-grotesk text-lg">
              <RainbowButton className="text-5xl pt-8 pb-8" onClick={capture}>
                <MdOutlineCamera />
              </RainbowButton>
            </div>
          )}

          {/* Image UI */}
          {isImageCaptured && urlRef.current && (
            <div className="flex flex-col items-center mt-2">
              <img
                className="rounded-xl border-4"
                src={urlRef.current}
                alt="Screenshot"
                width={540}
                height={360}
              />
            </div>
          )}
        </div>

        {/* Buttons Below Both UIs */}
        {isImageCaptured && urlRef.current && (
          <div className="flex justify-center gap-4 mt-8 font-grotesk text-lg">
            <RainbowButton onClick={handleDelete}>Delete</RainbowButton>
            <RainbowButton
              onClick={() => router.push("/editor")}
              className={!isAttested ? "opacity-50 cursor-not-allowed" : ""}
              disabled={!isAttested}
            >
              Edit
            </RainbowButton>
            <RainbowButton onClick={handleUpload}>Attest</RainbowButton>
          </div>
        )}
      </div>
      {/* {isImageCaptured && urlRef.current && (
        <div className="w-full flex flex-col items-center mt-8 font-grotesk">
          
        </div>
      )} */}
      {(ipfsHashLog || shareableLink) && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
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
            <div className="mt-2 flex items-center space-x-2">
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
      <div className="font-grotesk font-semibold text-blue-600 absolute bottom-0.5 left-14">
        <h1 className="font-bold text-black text-2xl underline font-josefin">
          Capture & Attest Walkthrough:-
        </h1>
        <h1>
          <strong className="font-bold text-black">Start: </strong>To Start the
          in-built Camera functionality
        </h1>
        <h1>
          <strong className="font-bold text-black">End: </strong>To End the
          in-built Camera functionality
        </h1>
        <h1>
          <strong className="font-bold text-black">Capture: </strong>To click
          the Image
        </h1>
        <h1>
          <strong className="font-bold text-black">Retake: </strong>To shoot the
          Image again
        </h1>
        <h1>
          <strong className="font-bold text-black">Edit: </strong>Move to Editor
          and edit the Image
        </h1>
        <h1>
          <strong className="font-bold text-black">Attest: </strong>To Attest
          the Image uniquely Digital Image Provenance
        </h1>
      </div>
    </>
  );
}
