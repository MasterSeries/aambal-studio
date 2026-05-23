import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "motion/react";

export default function ShootDetails() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const ref = doc(db, "shoot_details", "main");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setData(snap.data());
      }
    }

    fetchData();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white px-6 py-24">
      <div className="max-w-7xl mx-auto">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold mb-8"
        >
          {data.title}
        </motion.h1>

        <p className="text-white/70 text-lg max-w-3xl mb-10">
          {data.description}
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {data.images?.map((img: string, i: number) => (
            <img
              key={i}
              src={img}
              className="rounded-3xl h-[300px] object-cover w-full"
            />
          ))}
        </div>

        <div className="mb-10">
          <h2 className="text-4xl mb-6">
            Packages
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {data.plans?.map((plan: any, i: number) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-3xl p-8"
              >
                <h3 className="text-2xl font-semibold mb-3">
                  {plan.name}
                </h3>

                <div className="text-5xl font-bold text-primary mb-5">
                  ₹{plan.price}
                </div>

                <ul className="space-y-3">
                  {plan.features?.map(
                    (feature: string, idx: number) => (
                      <li key={idx}>
                        ✨ {feature}
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-3xl p-8">
          <h3 className="text-3xl mb-4">
            Special Offer
          </h3>

          <p className="text-xl">
            {data.offer}
          </p>
        </div>

      </div>
    </div>
  );
}