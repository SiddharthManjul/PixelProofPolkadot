import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});

const UploadToPinata = async (image: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const upload = await pinata.upload.base64(image);
};

export default UploadToPinata;
