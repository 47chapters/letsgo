export default function Navbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-col md:flex bg-red-100">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">{children}</div>
      </div>
    </div>
  );
}
