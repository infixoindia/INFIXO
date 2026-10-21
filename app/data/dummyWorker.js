// Fallback data — used only if Supabase is unreachable.
// Shape matches EMPTY_WORKER_SCHEMA in lib/workerService.js exactly.
const dummyWorker = {
  id: "",
  slug: "rahul-sharma",
  fullName: "Rahul Sharma",
  profession: "Electrician",
  experience: 8,
  serviceArea: ["Indore"],
  heroSlides: [
    { image: "/images/worker-1.avif" },
    { image: "/images/worker-2.avif" },
    { image: "/images/worker-3.avif" },
  ],

  primarySkill: "Painter",
  services: ["Putty Work", "Texture Finish", "Waterproofing", "Interior Paints"],
  workingHours: "9:00 AM – 7:00 PM",
  workingShift: { day: true, night: true },
  whyChooseMe: [
    "साफ-सुथरा और प्रोफेशनल काम",
    "प्रीमियम पेंट फिनिश",
    "समय पर काम पूरा",
    "सही और किफायती रेट",
    "8+ साल का भरोसेमंद अनुभव",
    "कस्टमर की संतुष्टि",
  ],
  whyChooseMeEn: [
    "Clean & Professional Work",
    "Premium Paint Finish",
    "On Time Work",
    "Reasonable Pricing",
    "8+ Years Trusted Experience",
    "Customer Satisfaction",
  ],

  gender: "Male",
  age: "28 Years",
  address: "Indore, Madhya Pradesh",
  languages: ["Hindi", "English"],
  about: [
    "राहुल शर्मा एक मेहनती और भरोसेमंद प्रोफेशनल हैं, जो साफ-सुथरे और अच्छी क्वालिटी वाले पेंटिंग वर्क के लिए जाने जाते हैं।",
    "वह अपने काम की हर छोटी-बड़ी डिटेल पर ध्यान देते हैं और हर प्रोजेक्ट को पूरी जिम्मेदारी के साथ एक प्रीमियम फिनिश देते हैं।",
    "उनका मकसद है कि कस्टमर को सही जानकारी, समय पर सर्विस और अच्छे काम के साथ एक बेहतरीन अनुभव मिले।",
  ],
  aboutEn: [
    "Rahul Sharma is a dedicated and reliable professional known for delivering clean and high-quality painting work.",
    "He pays close attention to every detail and ensures every project is completed with care and a premium finish.",
    "His goal is to provide a smooth experience through honest communication, timely service, and customer satisfaction.",
  ],

  verifications: {
    identityVerified: true,
    workVerified: true,
    addressVerified: true,
  },
  isVerified: true,

  photos: [
    "/images/work1.png",
    "/images/work2.png",
    "/images/work3.png",
    "/images/work4.png",
    "/images/work5.png",
    "/images/work6.png",
  ],
  videos: [
    { video: "/videos/work1.mp4", thumbnail: "/images/video-thumb-1.jpg", duration: "00:10" },
    { video: "/videos/work2.mp4", thumbnail: "/images/video-thumb-2.jpg", duration: "00:10" },
    { video: "/videos/work3.mp4", thumbnail: "/images/video-thumb-3.jpg", duration: "00:10" },
    { video: "/videos/work4.mp4", thumbnail: "/images/video-thumb-4.jpg", duration: "00:10" },
  ],
};

export default dummyWorker;
