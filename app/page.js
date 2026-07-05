import Header from "./components/Header/Header";
import WorkerIdentityCard from "./components/Header/WorkerIdentityCard";

export default function HomePage() {
  return (
    <main style={{ background: "#F6F7F9", minHeight: "100vh" }}>
      
      {/* Header Section */}
      <Header />

      {/* Profile Section Wrapper */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        padding: "24px 16px"
      }}>
        <WorkerIdentityCard />
      </div>

    </main>
  );
}
