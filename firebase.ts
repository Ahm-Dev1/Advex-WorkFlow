import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// =================================================================================
// TODO: أدخل إعدادات مشروع Firebase الخاص بك هنا
// 1. انتقل إلى وحدة تحكم Firebase (https://console.firebase.google.com/)
// 2. أنشئ مشروعًا جديدًا أو حدد مشروعًا موجودًا.
// 3. انتقل إلى "إعدادات المشروع" (Project Settings).
// 4. في قسم "تطبيقاتك" (Your apps)، ابحث عن كائن إعداد SDK (firebaseConfig).
// 5. انسخ القيم والصقها في الكائن أدناه.
// =================================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAmDLOXZ_GdrhxoGhnXjMq2H1aZxV-zc4M",
  authDomain: "advex-work.firebaseapp.com",
  projectId: "advex-work",
  storageBucket: "advex-work.firebasestorage.app",
  messagingSenderId: "189943605875",
  appId: "1:189943605875:web:24ca9d0089b3e554fa9806",
  measurementId: "G-BT24B6QBGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export firestore database instance
export const db = getFirestore(app);