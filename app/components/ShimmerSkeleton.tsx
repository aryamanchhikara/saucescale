"use client";

export default function ShimmerSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mt-2">
      <div className="lg:col-span-2 h-80 shimmer" style={{ border: "3px solid #1a2470", boxShadow: "5px 5px 0 #000" }} />
      <div className="flex flex-col gap-6">
        <div className="h-44 shimmer" style={{ border: "3px solid #1a2470", boxShadow: "5px 5px 0 #000" }} />
        <div className="h-32 shimmer" style={{ border: "3px solid #1a2470", boxShadow: "5px 5px 0 #000" }} />
      </div>
    </div>
  );
}
