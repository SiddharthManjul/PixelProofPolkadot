"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ImageContextType {
  imageSrc: string | null;
  setImageSrc: (src: string | null) => void;
  timestamp: string | null;
  setTimestamp: (timestamp: string | null) => void;
  ipfsHash: string | null;
  setIpfsHash: (hash: string | null) => void;
}

const ImageContext = createContext<ImageContextType>({
  imageSrc: null,
  setImageSrc: () => {},
  timestamp: null,
  setTimestamp: () => {},
  ipfsHash: null,
  setIpfsHash: () => {},
});

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  return (
    <ImageContext.Provider 
      value={{ 
        imageSrc, 
        setImageSrc, 
        timestamp, 
        setTimestamp, 
        ipfsHash, 
        setIpfsHash 
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImageContext = () => useContext(ImageContext);