/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { ImageKitProvider } from "imagekitio-next";
import { useImageContext } from "../utils/imageContext";
import { PinataSDK } from "pinata-web3";
import { Schema, Text, U64 } from "@truenetworkio/sdk";
import { getTrueNetworkInstance } from "@/true-network/true.config";
import { useWalletStore } from "@/src/providers/walletStoreProvider";
import { RainbowButton } from "./ui/rainbow-button";

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

  const { connectedAccount, isWalletConnected } = useWalletStore(
    (s) => s
  );

  const { imageSrc } = useImageContext();
  const imageSrcRef = useRef<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [fileSystemImage] = useState<string | null>(null);
  const ipfsHashRef = useRef<string | null>(null);

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
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
    console.log("Uploaded", ipfsHashRef);
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
          {capturedImage && (
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-2">Captured Image</h3>
              <img
                src={capturedImage}
                alt="Captured"
                className="max-w-full max-h-[400px] rounded-lg shadow-md border-2"
              />
            </div>
          )}

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

        {urlRef.current && (
          <div className="flex justify-center gap-4 mt-8 font-grotesk text-lg">
            <RainbowButton onClick={handleUpload}>Attest</RainbowButton>
          </div>
        )}
      </div>
    </ImageKitProvider>
  );
}


// bafkreibcj7ebiwz7anglniumv2c2vam6cur72l7gmljp7uksi5ui5fo3pe