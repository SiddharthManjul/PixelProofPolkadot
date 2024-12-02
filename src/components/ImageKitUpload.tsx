/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { IKImage, ImageKitProvider } from "imagekitio-next";
import { useImageContext } from "../utils/imageContext";
import { PinataSDK } from "pinata-web3";
import { Schema, Text, U64 } from "@truenetworkio/sdk";
import { getTrueNetworkInstance } from "@/true-network/true.config";
import { useWalletStore } from "@/src/providers/walletStoreProvider";
import { RainbowButton } from "./ui/rainbow-button";

type EditAction = "brightness" | "contrast" | "saturation" | "crop" | "rotate";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
  pinataGateway: "ivory-tough-leech-456.mypinata.cloud",
});

const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT || "";
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY || "";

const authenticator = async () => {
  try {
    const response = await fetch("/api/auth");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }
    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    throw new Error(
      `Authentication request failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export default function ImageKitUploadComponent() {
  const { connectedAccount, isWalletConnected } = useWalletStore((s) => s);
  const [editedImage, setEditedImage] = useState<string>("");
  const [currentAction, setCurrentAction] = useState<EditAction | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { imageSrc } = useImageContext();
  const imageSrcRef = useRef<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [fileSystemImage] = useState<string | null>(null);
  const ipfsHashRef = useRef<string | null>(null);
  const [ipfsHashLog, setIpfsHashLog] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [shareableLink, setShareableLink] = useState<string | null>(null);

  useEffect(() => {
    // Create a new Image if not already created
    if (!imageRef.current) {
      imageRef.current = new Image();
    }
  
    if (imageSrc) {
      imageRef.current.onload = () => {
        // ... existing load logic ...
      };
      imageRef.current.src = imageSrc;
    }
  }, [imageSrc]);

  useEffect(() => {
    // Update captured image from context
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [imageSrc]);

  if (capturedImage) {
    imageSrcRef.current = capturedImage;
    urlRef.current = capturedImage;
  }

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

  // Extract base64 without metadata
  useEffect(() => {
    if (imageSrc && imageRef.current) {
      imageRef.current.src = imageSrc;
      imageRef.current.onload = () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          // Set canvas to image's original dimensions
          canvas.width = imageRef?.current?.width ?? 400;
          canvas.height = imageRef?.current?.height ?? 400;

          // Draw original image
          ctx?.drawImage(imageRef.current!, 0, 0);

          // Set initial edited image
          setEditedImage(canvas.toDataURL());
        }
      };
    }
  }, [imageSrc]);

  const adjustBrightnessEdit = (value: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Clear canvas and redraw original image
    ctx.drawImage(imageRef.current!, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * value); // Red
      data[i + 1] = Math.min(255, data[i + 1] * value); // Green
      data[i + 2] = Math.min(255, data[i + 2] * value); // Blue
    }

    ctx.putImageData(imageData, 0, 0);
    setEditedImage(canvas.toDataURL());
  };

  const rotateImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Rotate 90 degrees
    canvas.width = imageRef?.current?.height ?? 400;
    canvas.height = imageRef?.current?.width ?? 400;

    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(imageRef.current!, 0, 0);

    setEditedImage(canvas.toDataURL());
  };

  const cropImage = (x: number, y: number, width: number, height: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(imageRef.current!, x, y, width, height, 0, 0, width, height);

    setEditedImage(canvas.toDataURL());
  };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFileSystemImage(reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  return (
    <ImageKitProvider
      urlEndpoint={urlEndpoint}
      publicKey={publicKey}
      authenticator={authenticator}
    >
      <div className="flex flex-col items-center space-y-4 p-4">
        <h2 className="text-2xl font-bold mb-4">Image Upload</h2>

        {/* Image Preview Section */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          {/* Captured Image Preview */}
          {/* {capturedImage && (
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Captured Image</h3>
              <img
                src={capturedImage}
                alt="Captured"
                className="max-w-full max-h-[400px] rounded-lg shadow-md border-2"
              />
            </div> */}
          {/* )} */}

          {/* File System Image Preview */}
          {fileSystemImage && (
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">File System Image</h3>
              <img
                src={fileSystemImage}
                alt="File System"
                className="max-w-full max-h-[400px] rounded-lg shadow-md border-2"
              />
            </div>
          )}
        </div>

        <div className="image-editor">
          <canvas
            ref={canvasRef}
            className="edit-canvas"
            style={{ maxWidth: "100%", height: "auto" }}
          />

          <div className="edit-controls">
            <button
              onClick={() => {
                setCurrentAction("brightness");
                adjustBrightnessEdit(1.5);
              }}
            >
              Increase Brightness
            </button>

            <button
              onClick={() => {
                setCurrentAction("rotate");
                rotateImage();
              }}
            >
              Rotate 90°
            </button>

            <button
              onClick={() => {
                // Example crop: crop center 50%
                const srcWidth = imageRef.current?.width ?? 400;
                const srcHeight = imageRef.current?.height ?? 400;
                cropImage(
                  srcWidth / 4,
                  srcHeight / 4,
                  srcWidth / 2,
                  srcHeight / 2
                );
              }}
            >
              Crop Center
            </button>
          </div>
        </div>

        {urlRef.current && (
          <div className="flex justify-center gap-4 mt-8 font-grotesk text-lg">
            <RainbowButton onClick={handleUpload}>Attest</RainbowButton>
          </div>
        )}

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
      </div>
    </ImageKitProvider>
  );
}

// bafkreibcj7ebiwz7anglniumv2c2vam6cur72l7gmljp7uksi5ui5fo3pe
