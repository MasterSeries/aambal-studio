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
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export const Route =
  createFileRoute("/profile")({
    component: ProfilePage,
  });

function ProfilePage() {
  const [loading, setLoading] =
    useState(true);

  const [userId, setUserId] =
    useState("");

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [favoritePackage,
    setFavoritePackage] =
    useState("");

  const [photoURL,
    setPhotoURL] =
    useState("");

  const [image,
    setImage] =
    useState<File | null>(null);

  useEffect(() => {
  const unsubscribe =
    onAuthStateChanged(
      auth,
      async (user) => {
        try {
          if (!user) {
            window.location.href =
              "/customer-login";

            return;
          }

          setUserId(user.uid);

          setName(
            user.displayName || ""
          );

          setEmail(
            user.email || ""
          );

          setPhotoURL(
            user.photoURL || ""
          );

          const docRef = doc(
            db,
            "users",
            user.uid
          );

          const docSnap =
            await getDoc(docRef);

          // IF USER PROFILE EXISTS
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
                user.photoURL ||
                ""
            );
          }

          // IF PROFILE DOES NOT EXIST
          else {
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
              }
            );
          }
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

  async function uploadImage() {
    if (!image) return photoURL;

    const imageRef = ref(
      storage,
      `profiles/${userId}`
    );

    await uploadBytes(
      imageRef,
      image
    );

    const url =
      await getDownloadURL(
        imageRef
      );

    return url;
  }

  async function saveProfile() {
    try {
      setLoading(true);

      let imageUrl =
        photoURL;

      if (image) {
        imageUrl =
          await uploadImage();
      }

      await setDoc(
        doc(
          db,
          "users",
          userId
        ),
        {
          name,
          email,
          phone,
          address,
          favoritePackage,
          photoURL: imageUrl,
        }
      );

      if (auth.currentUser) {
        await updateProfile(
          auth.currentUser,
          {
            displayName: name,
            photoURL: imageUrl,
          }
        );
      }

      alert(
        "Profile updated!"
      );
    } catch (err) {
      console.error(err);

      alert(
        "Failed to update profile"
      );
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-[#07070b] px-4 py-8 text-white sm:px-6 lg:px-10">
      
      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        
        <div>
          <h1 className="text-5xl font-black">
            My Profile
          </h1>

          <p className="mt-3 text-white/50">
            Manage your account
          </p>
        </div>

        <a
          href="/customer-dashboard"
          className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-semibold transition hover:border-pink-400 hover:text-pink-300"
        >
          Back to Dashboard
        </a>
      </div>

      {/* PROFILE CARD */}
      <div className="overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] backdrop-blur-3xl">
        
        {/* TOP */}
        <div className="relative border-b border-white/10 p-8">
          
          <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-6 lg:flex-row">
            
            {/* PROFILE IMAGE */}
            <div className="relative">
              
              <img
                src={
                  photoURL ||
                  "https://ui-avatars.com/api/?name=User"
                }
                className="h-36 w-36 rounded-full border-4 border-pink-500/30 object-cover"
              />

              <label className="absolute bottom-0 right-0 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-pink-500 text-xl font-bold shadow-lg">
                +
                
                <input
                  type="file"
                  hidden
                  onChange={(e) =>
                    setImage(
                      e.target.files?.[0] ||
                        null
                    )
                  }
                />
              </label>
            </div>

            {/* INFO */}
            <div className="text-center lg:text-left">
              
              <h2 className="text-4xl font-black">
                {name || "Customer"}
              </h2>

              <p className="mt-2 text-white/50">
                {email}
              </p>

              <div className="mt-5 inline-flex rounded-full bg-pink-500/15 px-5 py-2 text-sm font-semibold text-pink-300">
                Festival Member
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="grid gap-8 p-8 lg:grid-cols-2">
          
          {/* LEFT */}
          <div className="space-y-6">
            
            <div>
              <label className="mb-3 block text-sm text-white/50">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-pink-400"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm text-white/50">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                disabled
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white/50"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm text-white/50">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-pink-400"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            
            <div>
              <label className="mb-3 block text-sm text-white/50">
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-pink-400"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm text-white/50">
                Favorite Package
              </label>

              <select
                value={
                  favoritePackage
                }
                onChange={(e) =>
                  setFavoritePackage(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-pink-400"
              >
                <option value="">
                  Select Package
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

            {/* SAVE BUTTON */}
            <button
              onClick={saveProfile}
              className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-pink-400 py-4 text-lg font-bold text-white shadow-lg shadow-pink-500/20 transition hover:scale-[1.02]"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        
        <a
          href="/customer-dashboard"
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition hover:border-pink-400"
        >
          <div className="text-4xl">
            📅
          </div>

          <div className="mt-5 text-2xl font-bold">
            My Bookings
          </div>

          <div className="mt-2 text-white/50">
            View all bookings
          </div>
        </a>

        <a
          href="/gallery"
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition hover:border-pink-400"
        >
          <div className="text-4xl">
            🖼️
          </div>

          <div className="mt-5 text-2xl font-bold">
            Gallery
          </div>

          <div className="mt-2 text-white/50">
            View festival photos
          </div>
        </a>

        <a
          href="/"
          className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition hover:border-pink-400"
        >
          <div className="text-4xl">
            🎉
          </div>

          <div className="mt-5 text-2xl font-bold">
            Festival Home
          </div>

          <div className="mt-2 text-white/50">
            Explore festival site
          </div>
        </a>
      </div>
    </div>
  );
}