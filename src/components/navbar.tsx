import Header from "./Header";

export default function Navbar() {
  return (
    <div className="absolute z-50 w-full top-0 left-0">
      <h1 className="hidden md:block absolute z-100 top-10 left-14 font-grotesk font-bold text-4xl text-[#17153B]">
        PixelProof
      </h1>
      <div>
        {/* <RainbowButton className="bg-black top-4 right-4 md:right-8 absolute font-grotesk md:top-8">Login/Signup</RainbowButton> */}
        <span className="bg-transparent top-4 right-4 absolute z-100 font-grotesk md:top-8">
          <Header />
        </span>
      </div>
    </div>
  );
}
