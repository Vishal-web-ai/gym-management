import MarketingShell from "./MarketingShell";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg-base">
      {/* Dot grid pattern */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,138,0,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Radial glow gradients — static, no animation */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {/* Top glow — amber */}
        <div
          className="absolute"
          style={{
            width: "70vw",
            height: "60vh",
            top: "-10%",
            left: "15%",
            background:
              "radial-gradient(ellipse at center, rgba(255,120,0,0.06), transparent 70%)",
            filter: "blur(24px)",
          }}
        />

        {/* Middle glow — red */}
        <div
          className="absolute"
          style={{
            width: "60vw",
            height: "50vh",
            top: "35%",
            right: "-5%",
            background:
              "radial-gradient(ellipse at center, rgba(220,38,38,0.04), transparent 70%)",
            filter: "blur(36px)",
          }}
        />

        {/* Bottom glow — amber */}
        <div
          className="absolute"
          style={{
            width: "80vw",
            height: "55vh",
            bottom: "5%",
            left: "10%",
            background:
              "radial-gradient(ellipse at center, rgba(255,100,0,0.05), transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      <MarketingShell>{children}</MarketingShell>
    </div>
  );
}
