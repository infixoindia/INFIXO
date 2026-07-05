import Header from "./components/Header/Header";
import WorkerIdentityCard from "./components/WorkerIdentityCard";

export default function HomePage() {
  return (
    <main style={{ background: "#F6F7F9", minHeight: "100vh" }}>
      
      {/* Header Section */}
      <Header />

      {/* Profile Section Wrapper */}
      <div style={{
        paddingTop: "20px",
        paddingBottom: "40px"
      }}>
        <WorkerIdentityCard />
      </div>

    </main>
  );
}
