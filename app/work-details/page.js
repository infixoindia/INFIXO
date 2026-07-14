import Header from "../components/Header/Header";
import WorkDetails from "../components/WorkDetails/WorkDetails";

export default function WorkDetailsPage() {
  return (
    <main>
      <Header />

      <div style={{ padding: "2rem 1rem" }}>
        <WorkDetails />
      </div>
    </main>
  );
}
