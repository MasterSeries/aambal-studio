import { createFileRoute } from "@tanstack/react-router";

import { useEffect, useState } from "react";

import {
  auth,
  db,
  storage,
} from "@/lib/firebase";

import {
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export const Route =
  createFileRoute(
    "/customer-profile"
  )({
    component: CustomerProfile,
  });

function CustomerProfile() {
  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uid, setUid] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [
    favoritePackage,
    setFavoritePackage,
  ] = useState("");

  const [photoURL, setPhotoURL] =
    useState("");

  const [totalBookings,
    setTotalBookings] =
    useState(0);

  const [completedBookings,
    setCompletedBookings] =
    useState(0);

  const [galleryCount,
    setGalleryCount] =
    useState(0);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            window.location.href =
              "/customer-login";

            return;
          }

          setUid(user.uid);

          setName(
            user.displayName || ""
          );

          setEmail(
            user.email || ""
          );

          setPhotoURL(
            user.photoURL || ""
          );

          try {
            // PROFILE
            const docRef = doc(
              db,
              "users",
              user.uid
            );

            const docSnap =
              await getDoc(docRef);

            if (docSnap.exists()) {
              const data =
                docSnap.data();

              setPhone(
                data.phone || ""
              );

              setAddress(
                data.address || ""
              );

              setFavoritePackage(
                data.favoritePackage ||
                  ""
              );

              setPhotoURL(
                data.photoURL ||
                  ""
              );
            } else {
              await setDoc(
                doc(
                  db,
                  "users",
                  user.uid
                ),
                {
                  name:
                    user.displayName ||
                    "",

                  email:
                    user.email || "",

                  phone: "",

                  address: "",

                  favoritePackage:
                    "",

                  photoURL:
                    user.photoURL ||
                    "",

                  createdAt:
                    new Date(),
                }
              );
            }

            // BOOKINGS
            const bookingQuery =
              query(
                collection(
                  db,
                  "bookings"
                ),

                where(
                  "email",
                  "==",
                  user.email
                )
              );

            const bookingSnap =
              await getDocs(
                bookingQuery
              );

            setTotalBookings(
              bookingSnap.size
            );

            let completed = 0;

            bookingSnap.forEach(
              (doc) => {
                if (
                  doc.data()
                    .status ===
                  "completed"
                ) {
                  completed++;
                }
              }
            );

            setCompletedBookings(
              completed
            );

            // FAKE GALLERY COUNT
            setGalleryCount(
              Math.floor(
                Math.random() * 120
              ) + 20
            );
          } catch (err) {
            console.error(err);

            alert(
              "Failed to load profile"
            );
          } finally {
            setLoading(false);
          }
        }
      );

    return () => unsubscribe();
  }, []);

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    try {
      const storageRef = ref(
        storage,
        `profiles/${uid}`
      );

      await uploadBytes(
        storageRef,
        file
      );

      const url =
        await getDownloadURL(
          storageRef
        );

      setPhotoURL(url);

      if (auth.currentUser) {
        await updateProfile(
          auth.currentUser,
          {
            photoURL: url,
          }
        );
      }
    } catch (err) {
      console.error(err);

      alert(
        "Image upload failed"
      );
    }
  }

  async function saveProfile() {
    try {
      setSaving(true);

      await setDoc(
        doc(db, "users", uid),
        {
          name,
          email,
          phone,
          address,
          favoritePackage,
          photoURL,

          updatedAt:
            new Date(),
        },
        { merge: true }
      );

      alert(
        "Profile updated"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Save failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070b] text-3xl font-bold text-white">
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070b] px-4 py-8 text-white md:px-8">
      
      <div className="mx-auto max-w-7xl">
        
        {/* HERO */}
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-pink-500/10 to-white/[0.03] p-8 md:p-12">
          
          <div className="absolute right-[-100px] top-[-100px] h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center">
            
            {/* PROFILE IMAGE */}
            <div className="relative">
              
              <img
                src={
                  photoURL ||
                  "https://ui-avatars.com/api/?name=User"
                }
                className="h-44 w-44 rounded-full border-4 border-pink-500/20 object-cover shadow-2xl"
              />

              <label className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-pink-500 px-5 py-2 text-sm font-bold shadow-lg">
                Edit

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleImageUpload
                  }
                />
              </label>
            </div>

            {/* INFO */}
            <div className="flex-1">
              
              <h1 className="text-5xl font-black tracking-tight">
                {name || "Customer"}
              </h1>

              <p className="mt-4 text-lg text-white/60">
                {email}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                
                <a
                  href="/customer-dashboard"
                  className="rounded-2xl bg-pink-500 px-6 py-4 font-bold transition hover:bg-pink-400"
                >
                  My Bookings
                </a>

                <a
                  href="/customer-gallery"
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-4 font-semibold"
                >
                  Gallery
                </a>

                <a
                  href="/"
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-4 font-semibold"
                >
                  Home
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          
          <StatsCard
            title="Total Bookings"
            value={totalBookings}
          />

          <StatsCard
            title="Completed"
            value={completedBookings}
          />

          <StatsCard
            title="Gallery Photos"
            value={galleryCount}
          />

          <StatsCard
            title="Favorite Package"
            value={
              favoritePackage ||
              "None"
            }
          />
        </div>

        {/* CONTENT */}
        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.8fr]">
          
          {/* LEFT */}
          <div className="rounded-[36px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl">
            
            <h2 className="mb-8 text-4xl font-black">
              Personal Details
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              
              <InputField
                placeholder="Full Name"
                value={name}
                onChange={setName}
              />

              <InputField
                placeholder="Phone Number"
                value={phone}
                onChange={setPhone}
              />
            </div>

            <div className="mt-5">
              
              <input
                type="email"
                disabled
                value={email}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 opacity-60"
              />
            </div>

            <div className="mt-5">
              
              <textarea
                rows={5}
                placeholder="Address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4"
              />
            </div>

            <div className="mt-5">
              
              <select
                value={
                  favoritePackage
                }
                onChange={(e) =>
                  setFavoritePackage(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4"
              >
                <option value="">
                  Favorite Package
                </option>

                <option>
                  Festival Portrait
                </option>

                <option>
                  Family & Group
                </option>

                <option>
                  Bridal / Couple
                </option>

                <option>
                  Full Day Coverage
                </option>
              </select>
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 px-6 py-5 text-lg font-black shadow-xl shadow-pink-500/20"
            >
              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>

          {/* RIGHT */}
          <div className="space-y-8">
            
            {/* PROFILE COMPLETION */}
            <div className="rounded-[36px] border border-white/10 bg-white/[0.03] p-8">
              
              <h2 className="text-3xl font-black">
                Profile Completion
              </h2>

              <div className="mt-8">
                
                <div className="mb-3 flex justify-between text-sm text-white/50">
                  
                  <span>
                    Completed
                  </span>

                  <span>
                    90%
                  </span>
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-white/10">
                  
                  <div className="h-full w-[90%] rounded-full bg-gradient-to-r from-pink-500 to-pink-300" />
                </div>
              </div>

              <div className="mt-8 space-y-4 text-sm text-white/60">
                
                <div>
                  ✓ Personal information
                </div>

                <div>
                  ✓ Profile image
                </div>

                <div>
                  ✓ Saved address
                </div>

                <div>
                  ✓ Favorite package
                </div>
              </div>
            </div>

            {/* QUICK ACCESS */}
            <div className="rounded-[36px] border border-white/10 bg-white/[0.03] p-8">
              
              <h2 className="text-3xl font-black">
                Quick Access
              </h2>

              <div className="mt-8 grid gap-4">
                
                <QuickButton
                  title="My Bookings"
                  link="/customer-dashboard"
                />

                <QuickButton
                  title="Photo Gallery"
                  link="/customer-gallery"
                />

                <QuickButton
                  title="Book New Event"
                  link="/#book"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
}: {
  title: string;
  value: any;
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
      
      <div className="text-sm uppercase tracking-wider text-white/50">
        {title}
      </div>

      <div className="mt-5 text-4xl font-black break-words">
        {value}
      </div>
    </div>
  );
}

function InputField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) =>
        onChange(
          e.target.value
        )
      }
      className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4"
    />
  );
}

function QuickButton({
  title,
  link,
}: {
  title: string;
  link: string;
}) {
  return (
    <a
      href={link}
      className="rounded-2xl border border-white/10 bg-black/20 px-6 py-5 text-lg font-semibold transition hover:border-pink-500 hover:bg-pink-500/10"
    >
      {title}
    </a>
  );
}