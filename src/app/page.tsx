import Link from "next/link";

export default function Home() {
  return (
    <div className="container min-h-dvh bg-[#FEF3F2] py-[5em] !px-[3.5em] max-md:!px-[2em]">
      <div className="flex justify-between items-center pb-[1.5em]  max-md:flex-col-reverse">
        <div className="text-2xl font-bold text-rose-700 pb-[0.5em] cursor-pointer flex gap-[0.35em]">Home</div>
        <div className="text-3xl font-bold text-gray-900 flex items-center gap-[0.5em]">
          <img src="logo.png" className="size-[2.5em]" alt="" />
          TTRPG OBS Overlay
        </div>
      </div>
      <button className="w-fit font-semibold bg-rose-700  px-[1em] pt-[0.15em] pb-[0.35em] rounded-[0.75em] text-white cursor-pointer transition-all duration-200 hover:bg-rose-800 hover:translate-y-[-0.1em]">
        <Link href="/dashboard">Dashboard</Link>
      </button>
    </div>
  );
}
