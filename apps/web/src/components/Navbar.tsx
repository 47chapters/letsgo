export default function Navbar({ children }: { children: React.ReactNode }) {
  const style = {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
  };

  return <div style={style}>{children}</div>;
}
