"use client";

import Header from "../Header/Header";
import WorkerIdentityCard from "../WorkerIdentityCard/WorkerIdentityCard";
import HeroSlider from "../HeroSlider/HeroSlider";
import NavigationTabs from "../NavigationTabs/NavigationTabs";
import WorkDetails from "../WorkDetails/WorkDetails";
import WorkPhotos from "../WorkPhotos/WorkPhotos";
import WorkVideos from "../WorkVideos/WorkVideos";
import WorkerDetails from "../WorkerDetails/WorkerDetails";
import Footer from "../Footer/Footer";

export default function WorkerMasterProfile({ worker }) {
  if (!worker) return null;

  return (
    <main style={{ width: "100%", overflowX: "hidden" }}>
      {/* Header */}
      <Header />

      {/* Identity Card */}
      <WorkerIdentityCard
        name={worker.fullName || worker.name}
        profession={worker.profession}
        workerCode={worker.workerCode}
        category={worker.category}
        location={worker.location}
        profileImage={worker.profileImage}
        verifiedBadge={worker.isVerified ?? worker.verifiedBadge}
      />

      {/* Hero Slider */}
      <HeroSlider images={worker.heroSlides || worker.heroImages || []} />

      {/* Navigation Tabs */}
      <NavigationTabs />

      {/* Work Details Section */}
      <section id="work-details">
        <WorkDetails data={worker.workDetails || worker} />
      </section>

      {/* Work Photos Section */}
      <section id="photos">
        <WorkPhotos photos={worker.photos || []} />
      </section>

      {/* Work Videos Section */}
      <section id="videos">
        <WorkVideos videos={worker.videos || []} />
      </section>

      {/* Worker Details / About Section */}
      <section id="worker-details">
        <WorkerDetails worker={worker} />
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
